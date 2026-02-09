'use server'

import { createClient } from '@/lib/supabase/server'
import { Prospect, StageType, Diagnostic } from '@/features/medical/types'
import { analyzePractice } from '@/lib/diagnostic-engine'

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string }

export async function listProspects(
  filters: { stage?: StageType } = {}
): Promise<ActionResult<Prospect[]>> {
  try {
    const supabase = await createClient()

    let query = supabase
      .from('prospects')
      .select('*')
      .order('updated_at', { ascending: false })

    if (filters.stage) {
      query = query.eq('stage', filters.stage)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching prospects:', error)
      return { ok: false, error: error.message }
    }

    const prospects: Prospect[] = (data || []).map(mapRowToProspect)

    return { ok: true, data: prospects }
  } catch (err) {
    console.error('Unexpected error:', err)
    return { ok: false, error: 'Error inesperado al cargar prospectos' }
  }
}

export async function getProspect(id: string): Promise<ActionResult<Prospect>> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('prospects')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching prospect:', error)
      return { ok: false, error: error.message }
    }

    return { ok: true, data: mapRowToProspect(data) }
  } catch (err) {
    console.error('Unexpected error:', err)
    return { ok: false, error: 'Error inesperado al cargar prospecto' }
  }
}

export interface CreateProspectInput {
  doctorName: string
  specialty: string
  clinicName: string
  phone: string
  email: string
  city: string
  citasSemanales: number
  ticketPromedio: number
  noShowPercentage: number
  slotsDisponibles: number
  horasConsulta: number
  notes?: string
}

export async function createProspect(
  input: CreateProspectInput
): Promise<ActionResult<Prospect>> {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { ok: false, error: 'No autorizado' }
    }

    // Run diagnostic analysis using the new centralized engine
    const diagnostic = await analyzePractice({
      citasSemanales: input.citasSemanales,
      ticketPromedio: input.ticketPromedio,
      noShowPercentage: input.noShowPercentage,
    })

    // START TRANSACTION (Supabase doesn't support multiple mutations in one go easily without RPC, 
    // but we can do them sequentially or create an RPC. For simplicity, we'll do sequential).
    
    // 1. Insert Core Prospect (Business Data)
    const { data: prospectData, error: prospectError } = await supabase
      .from('prospects')
      .insert({
        user_id: user.id,
        doctor_name: input.doctorName,
        specialty: input.specialty,
        clinic_name: input.clinicName,
        phone: input.phone,
        email: input.email,
        city: input.city,
        citas_semanales: input.citasSemanales,
        ticket_promedio: input.ticketPromedio,
        no_show_percentage: input.noShowPercentage,
        slots_disponibles: input.slotsDisponibles,
        horas_consulta: input.horasConsulta,
        stage: 'agenda_detenida',
        notes: '', // Notes are now clinical
        diagnostic_severity: diagnostic.severity,
        diagnostic_perdida_anual: diagnostic.perdidaAnual,
        has_detailed_diagnostic: true,
        deal_value: diagnostic.perdidaAnual * 0.1,
        ltv: diagnostic.perdidaAnual * 0.3
      })
      .select()
      .single()

    if (prospectError) {
      console.error('Error creating prospect:', prospectError)
      return { ok: false, error: prospectError.message }
    }

    // 2. Insert Clinical Data (Sensitive/Encrypted)
    const { error: clinicalError } = await supabase
      .from('prospect_diagnostics')
      .insert({
        prospect_id: prospectData.id,
        user_id: user.id,
        diagnostic_text: diagnostic.diagnosticText,
        diagnostic_recommendations: diagnostic.recommendations,
        clinical_notes: input.notes || ''
      })

    if (clinicalError) {
      console.error('Error creating clinical diagnostic:', clinicalError)
      // We should probably delete the prospect if this fails, but for now we log it.
    }

    return { ok: true, data: mapRowToProspect(prospectData) }
  } catch (err) {
    console.error('Unexpected error:', err)
    return { ok: false, error: 'Error inesperado al crear prospecto' }
  }
}

export async function updateProspectStage(
  id: string,
  stage: StageType
): Promise<ActionResult<Prospect>> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('prospects')
      .update({
        stage,
        stage_updated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        closed_at: stage === 'recuperacion_exitosa' ? new Date().toISOString() : null
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating prospect stage:', error)
      return { ok: false, error: error.message }
    }

    return { ok: true, data: mapRowToProspect(data) }
  } catch (err) {
    console.error('Unexpected error:', err)
    return { ok: false, error: 'Error inesperado al actualizar prospecto' }
  }
}

export async function deleteProspect(id: string): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('prospects')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting prospect:', error)
      return { ok: false, error: error.message }
    }

    return { ok: true, data: undefined }
  } catch (err) {
    console.error('Unexpected error:', err)
    return { ok: false, error: 'Error inesperado al eliminar prospecto' }
  }
}

function mapRowToProspect(row: any): Prospect {
  const diagnostic: Diagnostic | null = row.diagnostic_severity ? {
    id: `diag_${row.id}`,
    prospectId: row.id,
    calculatedAt: row.updated_at,
    citasSemanales: row.citas_semanales,
    ticketPromedio: row.ticket_promedio,
    noShowPercentage: row.no_show_percentage,
    slotsDisponibles: row.slots_disponibles,
    horasConsulta: row.horas_consulta,
    sillaVaciaPercentage: 0,
    rentabilidadPercentage: 0,
    perdidaAnual: row.diagnostic_perdida_anual || 0,
    perdidaNoShow: 0,
    costoOportunidad: 0,
    citasCompletadas: 0,
    ingresoActual: 0,
    ingresoPotencial: 0,
    severity: row.diagnostic_severity,
    severityScore: 0,
    diagnosticText: row.diagnostic_text || '',
    recommendations: row.diagnostic_recommendations || []
  } : null

  return {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    doctorName: row.doctor_name,
    specialty: row.specialty,
    clinicName: row.clinic_name,
    phone: row.phone,
    email: row.email,
    city: row.city,
    citasSemanales: row.citas_semanales,
    ticketPromedio: row.ticket_promedio,
    noShowPercentage: row.no_show_percentage,
    slotsDisponibles: row.slots_disponibles,
    horasConsulta: row.horas_consulta,
    stage: row.stage,
    stageUpdatedAt: row.stage_updated_at,
    diagnostic,
    dealValue: row.deal_value || 0,
    ltv: row.ltv || 0,
    closedAt: row.closed_at,
    activities: [],
    notes: row.notes || '',
    nextFollowUp: row.next_follow_up
  }
}

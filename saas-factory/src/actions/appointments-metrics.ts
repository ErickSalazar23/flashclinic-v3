'use server'

import { createClient } from '@/lib/supabase/server'

export interface AppointmentsMetrics {
  // Today's Operations
  citasHoy: number
  citasPendientesConfirmacion: number
  citasConfirmadas: number
  citasCanceladas: number

  // Risk Analysis
  citasEnRiesgo: number // pending + within 24h
  tasaNoShow: number    // historical no_show rate (0-100%)

  // Financial Impact (assuming $50 average ticket)
  hemorragiaHoy: number         // $ lost from cancelled/no-show today
  hemorragiaMes: number         // $ lost this month
  dineroRecuperado: number      // $ saved by confirmations
  dineroEnRiesgo: number        // $ at risk (pending)

  // System Activity (populated in Phase 4)
  systemActions: Array<{
    id: string
    description: string       // "Sistema envió confirmación a Juan Pérez"
    timestamp: string
  }>
}

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string }

const AVERAGE_TICKET = 50 // Assume $50 per appointment (configurable later)

export async function getAppointmentsMetrics(): Promise<ActionResult<AppointmentsMetrics>> {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        ok: false,
        error: 'No autenticado. Por favor inicia sesión.',
      }
    }

    // Get today's date range
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrowStart = new Date(today)
    tomorrowStart.setDate(tomorrowStart.getDate() + 1)

    const todayString = today.toISOString().split('T')[0]
    const tomorrowString = tomorrowStart.toISOString().split('T')[0]

    // Get this month's date range
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    // ============ TODAY'S APPOINTMENTS ============

    // Get all appointments for today
    const { data: todayAppointments, error: todayError } = await supabase
      .from('appointments')
      .select('id, status, appointment_date')
      .eq('user_id', user.id)
      .eq('appointment_date', todayString)

    if (todayError) throw new Error(`Failed to fetch today's appointments: ${todayError.message}`)

    const citasHoy = todayAppointments?.length || 0
    const citasConfirmadas = todayAppointments?.filter(a => a.status === 'confirmed').length || 0
    const citasCanceladas = todayAppointments?.filter(a => a.status === 'cancelled').length || 0
    const citasPendientesConfirmacion =
      todayAppointments?.filter(a => a.status === 'pending').length || 0

    // ============ APPOINTMENTS AT RISK (within 24h) ============

    const { data: riskAppointments, error: riskError } = await supabase
      .from('appointments')
      .select('id, status, appointment_date')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .gte('appointment_date', todayString)
      .lt('appointment_date', tomorrowString)

    if (riskError) throw new Error(`Failed to fetch risk appointments: ${riskError.message}`)

    const citasEnRiesgo = riskAppointments?.length || 0

    // ============ HISTORICAL NO-SHOW RATE ============

    // Get all past appointments (completed + no_show)
    const pastDate = new Date(today)
    pastDate.setDate(pastDate.getDate() - 1)
    const pastDateString = pastDate.toISOString().split('T')[0]

    const { data: pastAppointments, error: pastError } = await supabase
      .from('appointments')
      .select('id, status')
      .eq('user_id', user.id)
      .lt('appointment_date', todayString)

    if (pastError) throw new Error(`Failed to fetch past appointments: ${pastError.message}`)

    const totalPastAppointments = pastAppointments?.length || 1 // Avoid division by zero
    const noShowCount = pastAppointments?.filter(a => a.status === 'no_show').length || 0
    const tasaNoShow =
      totalPastAppointments > 0 ? Math.round((noShowCount / totalPastAppointments) * 100) : 0

    // ============ FINANCIAL IMPACT - TODAY ============

    const hemorragiaHoy = (citasCanceladas + todayAppointments?.filter(a => a.status === 'no_show').length || 0) * AVERAGE_TICKET
    const dineroEnRiesgo = citasPendientesConfirmacion * AVERAGE_TICKET

    // ============ FINANCIAL IMPACT - THIS MONTH ============

    const { data: monthAppointments, error: monthError } = await supabase
      .from('appointments')
      .select('id, status, appointment_date')
      .eq('user_id', user.id)
      .gte('appointment_date', startOfMonth.toISOString().split('T')[0])
      .lt('appointment_date', tomorrowString)

    if (monthError) throw new Error(`Failed to fetch month appointments: ${monthError.message}`)

    const hemorragiaMes =
      (monthAppointments?.filter(a => a.status === 'cancelled' || a.status === 'no_show').length || 0) * AVERAGE_TICKET

    // Confirmed appointments = money recovered
    const dineroRecuperado = (citasConfirmadas) * AVERAGE_TICKET

    // ============ SYSTEM ACTIONS (placeholder, will populate in Phase 4) ============

    // For now, return empty array. In Phase 4, this will query the prescriptions table
    const systemActions: Array<{ id: string; description: string; timestamp: string }> = []

    return {
      ok: true,
      data: {
        citasHoy,
        citasPendientesConfirmacion,
        citasConfirmadas,
        citasCanceladas,
        citasEnRiesgo,
        tasaNoShow,
        hemorragiaHoy,
        hemorragiaMes,
        dineroRecuperado,
        dineroEnRiesgo,
        systemActions
      }
    }
  } catch (error) {
    console.error('Error calculating appointments metrics:', error)
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Failed to calculate metrics'
    }
  }
}

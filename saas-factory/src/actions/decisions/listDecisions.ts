'use server'

import { createClient } from '@/lib/supabase/server'
import type { PendingDecision, DecisionWeight, ReferenceType } from '@/features/decisions/types'

// ============================================
// List Decisions Server Action
// ============================================

export interface ListDecisionsFilters {
  /** Filter by reference type */
  reference_type?: ReferenceType
  /** Filter by weight */
  weight?: DecisionWeight
  /** Filter by resolution status */
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL'
  /** Pagination limit */
  limit?: number
  /** Pagination offset */
  offset?: number
}

export type ListDecisionsResult =
  | { ok: true; data: PendingDecision[]; total: number }
  | { ok: false; error: string; code: 'UNAUTHORIZED' | 'INTERNAL' }

type DecisionWithPatient = PendingDecision & {
  patient?: { full_name: string; email: string }
}

export type ListDecisionsWithPatientsResult =
  | { ok: true; data: DecisionWithPatient[]; total: number }
  | { ok: false; error: string; code: 'UNAUTHORIZED' | 'INTERNAL' }

/**
 * Lists pending decisions with optional filters.
 *
 * @param filters - Optional filters for the query
 * @returns Result with decisions array and total count
 */
export async function listDecisions(
  filters: ListDecisionsFilters = {}
): Promise<ListDecisionsResult> {
  const {
    reference_type,
    weight,
    status = 'PENDING',
    limit = 20,
    offset = 0,
  } = filters

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      ok: false,
      error: 'Authentication required',
      code: 'UNAUTHORIZED',
    }
  }

  // Build query
  let query = supabase
    .from('pending_decisions')
    .select('*', { count: 'exact' })

  // Apply filters
  if (reference_type) {
    query = query.eq('reference_type', reference_type)
  }

  if (weight) {
    query = query.eq('weight', weight)
  }

  // Apply status filter
  if (status === 'PENDING') {
    query = query.is('resolved_at', null)
  } else if (status === 'APPROVED') {
    query = query.eq('resolution_type', 'APPROVED')
  } else if (status === 'REJECTED') {
    query = query.eq('resolution_type', 'REJECTED')
  }
  // 'ALL' - no filter

  // Apply ordering and pagination
  query = query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  const { data, error, count } = await query

  if (error) {
    console.error('[listDecisions] Query error:', error)
    return {
      ok: false,
      error: 'Failed to fetch decisions',
      code: 'INTERNAL',
    }
  }

  return {
    ok: true,
    data: (data || []) as PendingDecision[],
    total: count || 0,
  }
}

/**
 * Lists pending decisions with patient information.
 *
 * @param filters - Optional filters for the query
 * @returns Result with decisions including patient data
 */
export async function listDecisionsWithPatients(
  filters: ListDecisionsFilters = {}
): Promise<ListDecisionsWithPatientsResult> {
  const result = await listDecisions(filters)

  if (!result.ok) {
    return result
  }

  const supabase = await createClient()

  // Extract unique patient IDs from appointment_data
  const patientIds = new Set<string>()
  for (const decision of result.data) {
    if (decision.appointment_data && typeof decision.appointment_data === 'object') {
      const appointmentData = decision.appointment_data as Record<string, unknown>
      const patientId = appointmentData.patient_id as string | undefined
      if (patientId) {
        patientIds.add(patientId)
      }
    }
  }

  // Fetch all patients in one query
  const patientMap = new Map<string, { full_name: string; email: string }>()

  if (patientIds.size > 0) {
    const { data: patients } = await supabase
      .from('patients')
      .select('id, full_name, email')
      .in('id', Array.from(patientIds))

    if (patients) {
      for (const patient of patients) {
        patientMap.set(patient.id, {
          full_name: patient.full_name,
          email: patient.email,
        })
      }
    }
  }

  // Attach patient data to decisions
  const decisionsWithPatients: DecisionWithPatient[] = result.data.map((decision) => {
    let patient: { full_name: string; email: string } | undefined

    if (decision.appointment_data && typeof decision.appointment_data === 'object') {
      const appointmentData = decision.appointment_data as Record<string, unknown>
      const patientId = appointmentData.patient_id as string | undefined
      if (patientId) {
        patient = patientMap.get(patientId)
      }
    }

    return {
      ...decision,
      patient,
    }
  })

  return {
    ok: true,
    data: decisionsWithPatients,
    total: result.total,
  }
}

/**
 * Gets count of pending decisions by weight.
 *
 * @returns Counts by weight category
 */
export async function getPendingDecisionCounts(): Promise<{
  ok: true
  counts: { total: number; high: number; medium: number; low: number }
} | { ok: false; error: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { ok: false, error: 'Authentication required' }
  }

  const { data, error } = await supabase
    .from('pending_decisions')
    .select('weight')
    .is('resolved_at', null)

  if (error) {
    return { ok: false, error: 'Failed to fetch counts' }
  }

  const counts = {
    total: data?.length || 0,
    high: data?.filter(d => d.weight === 'HIGH').length || 0,
    medium: data?.filter(d => d.weight === 'MEDIUM').length || 0,
    low: data?.filter(d => d.weight === 'LOW').length || 0,
  }

  return { ok: true, counts }
}

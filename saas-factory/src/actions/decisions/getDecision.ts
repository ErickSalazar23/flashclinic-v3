'use server'

import { createClient } from '@/lib/supabase/server'
import type { PendingDecision } from '@/features/decisions/types'

// ============================================
// Get Decision Server Actions
// ============================================

export type GetDecisionResult =
  | { ok: true; data: PendingDecision }
  | { ok: false; error: string; code: 'NOT_FOUND' | 'UNAUTHORIZED' | 'INTERNAL' }

export type GetDecisionWithContextResult =
  | { ok: true; data: PendingDecision & { patient?: { full_name: string; email: string } } }
  | { ok: false; error: string; code: 'NOT_FOUND' | 'UNAUTHORIZED' | 'INTERNAL' }

/**
 * Gets a single pending decision by ID.
 *
 * @param id - The decision ID
 * @returns Result with decision or error
 */
export async function getDecision(id: string): Promise<GetDecisionResult> {
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

  const { data, error } = await supabase
    .from('pending_decisions')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return {
      ok: false,
      error: 'Decision not found',
      code: 'NOT_FOUND',
    }
  }

  return {
    ok: true,
    data: data as PendingDecision,
  }
}

/**
 * Gets a pending decision with related patient context.
 *
 * @param id - The decision ID
 * @returns Result with decision and patient info
 */
export async function getDecisionWithContext(id: string): Promise<GetDecisionWithContextResult> {
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

  const { data: decision, error } = await supabase
    .from('pending_decisions')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !decision) {
    return {
      ok: false,
      error: 'Decision not found',
      code: 'NOT_FOUND',
    }
  }

  // Get patient info from appointment_data if available
  let patient: { full_name: string; email: string } | undefined

  if (decision.appointment_data && typeof decision.appointment_data === 'object') {
    const appointmentData = decision.appointment_data as Record<string, unknown>
    const patientId = appointmentData.patient_id as string | undefined

    if (patientId) {
      const { data: patientData } = await supabase
        .from('patients')
        .select('full_name, email')
        .eq('id', patientId)
        .single()

      if (patientData) {
        patient = patientData
      }
    }
  }

  return {
    ok: true,
    data: {
      ...(decision as PendingDecision),
      patient,
    },
  }
}

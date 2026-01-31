'use server'

import { createClient } from '@/lib/supabase/server'
import type { Patient } from '@/features/patients/types'

// ============================================
// Get Patient Action
// ============================================

export type GetPatientResult =
  | { ok: true; data: Patient }
  | { ok: false; error: string; code: 'NOT_FOUND' | 'UNAUTHORIZED' | 'INTERNAL' }

/**
 * Gets a patient by ID.
 *
 * @param id - The patient ID
 * @returns Result with patient or error
 */
export async function getPatient(id: string): Promise<GetPatientResult> {
  // 1. Auth check
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

  // 2. Fetch patient
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return {
        ok: false,
        error: 'Patient not found',
        code: 'NOT_FOUND',
      }
    }

    console.error('[getPatient] Database error:', error)
    return {
      ok: false,
      error: 'Failed to fetch patient',
      code: 'INTERNAL',
    }
  }

  return {
    ok: true,
    data: data as Patient,
  }
}

/**
 * Gets a patient by email.
 *
 * @param email - The patient email
 * @returns Result with patient or error
 */
export async function getPatientByEmail(email: string): Promise<GetPatientResult> {
  // 1. Auth check
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

  // 2. Fetch patient
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('email', email)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return {
        ok: false,
        error: 'Patient not found',
        code: 'NOT_FOUND',
      }
    }

    console.error('[getPatientByEmail] Database error:', error)
    return {
      ok: false,
      error: 'Failed to fetch patient',
      code: 'INTERNAL',
    }
  }

  return {
    ok: true,
    data: data as Patient,
  }
}

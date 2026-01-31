'use server'

import { createClient } from '@/lib/supabase/server'
import type { Appointment } from '@/features/appointments/types'

// ============================================
// Get Appointment Action
// ============================================

export type GetAppointmentResult =
  | { ok: true; data: Appointment }
  | { ok: false; error: string; code: 'NOT_FOUND' | 'UNAUTHORIZED' | 'INTERNAL' }

/**
 * Gets an appointment by ID.
 *
 * @param id - The appointment ID
 * @returns Result with appointment or error
 */
export async function getAppointment(id: string): Promise<GetAppointmentResult> {
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

  // 2. Fetch appointment
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return {
        ok: false,
        error: 'Appointment not found',
        code: 'NOT_FOUND',
      }
    }

    console.error('[getAppointment] Database error:', error)
    return {
      ok: false,
      error: 'Failed to fetch appointment',
      code: 'INTERNAL',
    }
  }

  return {
    ok: true,
    data: data as Appointment,
  }
}

/**
 * Gets an appointment with patient details.
 *
 * @param id - The appointment ID
 * @returns Result with appointment and patient data
 */
export async function getAppointmentWithPatient(id: string): Promise<
  | { ok: true; data: Appointment & { patient: { full_name: string; email: string } } }
  | { ok: false; error: string; code: 'NOT_FOUND' | 'UNAUTHORIZED' | 'INTERNAL' }
> {
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

  // 2. Fetch appointment with patient
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      patient:patients(full_name, email)
    `)
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return {
        ok: false,
        error: 'Appointment not found',
        code: 'NOT_FOUND',
      }
    }

    console.error('[getAppointmentWithPatient] Database error:', error)
    return {
      ok: false,
      error: 'Failed to fetch appointment',
      code: 'INTERNAL',
    }
  }

  return {
    ok: true,
    data: data as Appointment & { patient: { full_name: string; email: string } },
  }
}

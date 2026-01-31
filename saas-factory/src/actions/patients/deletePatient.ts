'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

// ============================================
// Delete Patient Action
// ============================================

export type DeletePatientResult =
  | { ok: true }
  | { ok: false; error: string; code: 'NOT_FOUND' | 'HAS_APPOINTMENTS' | 'UNAUTHORIZED' | 'INTERNAL' }

/**
 * Deletes a patient.
 *
 * Note: This will fail if the patient has appointments due to foreign key constraint.
 *
 * @param id - The patient ID
 * @returns Result indicating success or error
 */
export async function deletePatient(id: string): Promise<DeletePatientResult> {
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

  // 2. Check patient exists
  const { data: existing } = await supabase
    .from('patients')
    .select('id')
    .eq('id', id)
    .single()

  if (!existing) {
    return {
      ok: false,
      error: 'Patient not found',
      code: 'NOT_FOUND',
    }
  }

  // 3. Check for existing appointments
  const { count: appointmentCount } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('patient_id', id)

  if (appointmentCount && appointmentCount > 0) {
    return {
      ok: false,
      error: 'Cannot delete patient with existing appointments',
      code: 'HAS_APPOINTMENTS',
    }
  }

  // 4. Delete patient
  const { error } = await supabase.from('patients').delete().eq('id', id)

  if (error) {
    console.error('[deletePatient] Database error:', error)
    return {
      ok: false,
      error: 'Failed to delete patient',
      code: 'INTERNAL',
    }
  }

  // 5. Revalidate and return
  revalidatePath('/patients')

  return {
    ok: true,
  }
}

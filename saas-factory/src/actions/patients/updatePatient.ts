'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { updatePatientSchema, type Patient } from '@/features/patients/types'

// ============================================
// Update Patient Action
// ============================================

export type UpdatePatientResult =
  | { ok: true; data: Patient }
  | { ok: false; error: string; code: 'VALIDATION' | 'NOT_FOUND' | 'DUPLICATE_EMAIL' | 'UNAUTHORIZED' | 'INTERNAL' }

/**
 * Updates an existing patient.
 *
 * @param id - The patient ID
 * @param formData - Form data with fields to update
 * @returns Result with updated patient or error
 */
export async function updatePatient(
  id: string,
  formData: FormData
): Promise<UpdatePatientResult> {
  // 1. Parse and validate input
  const rawInput: Record<string, unknown> = {}

  const fullName = formData.get('full_name')
  if (fullName) rawInput.full_name = fullName

  const email = formData.get('email')
  if (email) rawInput.email = email

  const phone = formData.get('phone')
  if (phone) rawInput.phone = phone

  const birthDate = formData.get('birth_date')
  if (birthDate) rawInput.birth_date = birthDate

  const isRecurring = formData.get('is_recurring')
  if (isRecurring !== null) rawInput.is_recurring = isRecurring === 'true'

  const parsed = updatePatientSchema.safeParse(rawInput)

  if (!parsed.success) {
    const errors = parsed.error.errors.map((e) => e.message).join(', ')
    return {
      ok: false,
      error: errors,
      code: 'VALIDATION',
    }
  }

  // 2. Auth check
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

  // 3. Check patient exists
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

  // 4. Check for duplicate email (if updating email)
  if (parsed.data.email) {
    const { data: emailTaken } = await supabase
      .from('patients')
      .select('id')
      .eq('email', parsed.data.email)
      .neq('id', id)
      .single()

    if (emailTaken) {
      return {
        ok: false,
        error: 'A patient with this email already exists',
        code: 'DUPLICATE_EMAIL',
      }
    }
  }

  // 5. Update patient
  const { data, error } = await supabase
    .from('patients')
    .update({
      ...parsed.data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('[updatePatient] Database error:', error)
    return {
      ok: false,
      error: 'Failed to update patient',
      code: 'INTERNAL',
    }
  }

  // 6. Revalidate and return
  revalidatePath('/patients')
  revalidatePath(`/patients/${id}`)

  return {
    ok: true,
    data: data as Patient,
  }
}

'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createPatientSchema, type Patient } from '@/features/patients/types'

// ============================================
// Create Patient Action
// ============================================

export type CreatePatientResult =
  | { ok: true; data: Patient }
  | { ok: false; error: string; code: 'VALIDATION' | 'DUPLICATE_EMAIL' | 'UNAUTHORIZED' | 'INTERNAL' }

/**
 * Creates a new patient.
 *
 * @param formData - Form data with patient fields
 * @returns Result with created patient or error
 */
export async function createPatient(formData: FormData): Promise<CreatePatientResult> {
  // 1. Parse and validate input
  const rawInput = {
    full_name: formData.get('full_name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    birth_date: formData.get('birth_date'),
    is_recurring: formData.get('is_recurring') === 'true',
  }

  const parsed = createPatientSchema.safeParse(rawInput)

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

  // 3. Check for duplicate email
  const { data: existing } = await supabase
    .from('patients')
    .select('id')
    .eq('email', parsed.data.email)
    .single()

  if (existing) {
    return {
      ok: false,
      error: 'A patient with this email already exists',
      code: 'DUPLICATE_EMAIL',
    }
  }

  // 4. Create patient
  const { data, error } = await supabase
    .from('patients')
    .insert({
      full_name: parsed.data.full_name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      birth_date: parsed.data.birth_date,
      is_recurring: parsed.data.is_recurring,
    })
    .select()
    .single()

  if (error) {
    console.error('[createPatient] Database error:', error)
    return {
      ok: false,
      error: 'Failed to create patient',
      code: 'INTERNAL',
    }
  }

  // 5. Revalidate and return
  revalidatePath('/patients')

  return {
    ok: true,
    data: data as Patient,
  }
}

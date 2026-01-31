'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { signupSchema } from '@/features/auth/types'

// ============================================
// Signup Action
// ============================================

export type SignupResult =
  | { ok: true }
  | { ok: false; error: string; code: 'VALIDATION' | 'EMAIL_EXISTS' | 'INTERNAL' }

/**
 * Creates a new user account.
 *
 * @param _prevState - Previous state (required by useActionState)
 * @param formData - Form data with signup fields
 * @returns Result or redirects to dashboard on success
 */
export async function signup(
  _prevState: SignupResult | null,
  formData: FormData
): Promise<SignupResult> {
  // 1. Parse and validate input
  const rawInput = {
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
    fullName: formData.get('fullName'),
  }

  const parsed = signupSchema.safeParse(rawInput)

  if (!parsed.success) {
    const errors = parsed.error.errors.map((e) => e.message).join(', ')
    return {
      ok: false,
      error: errors,
      code: 'VALIDATION',
    }
  }

  // 2. Create user
  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName,
      },
    },
  })

  if (error) {
    console.error('[signup] Auth error:', error.message)

    if (error.message.includes('already registered')) {
      return {
        ok: false,
        error: 'An account with this email already exists',
        code: 'EMAIL_EXISTS',
      }
    }

    return {
      ok: false,
      error: 'Failed to create account',
      code: 'INTERNAL',
    }
  }

  // 3. Redirect to dashboard on success
  redirect('/dashboard')
}

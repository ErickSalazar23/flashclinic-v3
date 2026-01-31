'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { loginSchema } from '@/features/auth/types'

// ============================================
// Login Action
// ============================================

export type LoginResult =
  | { ok: true }
  | { ok: false; error: string; code: 'VALIDATION' | 'INVALID_CREDENTIALS' | 'INTERNAL' }

/**
 * Authenticates user with email/password.
 *
 * @param _prevState - Previous state (required by useActionState)
 * @param formData - Form data with email and password
 * @returns Result or redirects to dashboard on success
 */
export async function login(
  _prevState: LoginResult | null,
  formData: FormData
): Promise<LoginResult> {
  // 1. Parse and validate input
  const rawInput = {
    email: formData.get('email'),
    password: formData.get('password'),
  }

  const parsed = loginSchema.safeParse(rawInput)

  if (!parsed.success) {
    const errors = parsed.error.errors.map((e) => e.message).join(', ')
    return {
      ok: false,
      error: errors,
      code: 'VALIDATION',
    }
  }

  // 2. Attempt sign in
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) {
    console.error('[login] Auth error:', error.message)
    return {
      ok: false,
      error: 'Invalid email or password',
      code: 'INVALID_CREDENTIALS',
    }
  }

  // 3. Redirect to dashboard on success
  redirect('/dashboard')
}

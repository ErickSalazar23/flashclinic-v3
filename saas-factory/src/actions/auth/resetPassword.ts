'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { resetPasswordSchema } from '@/features/auth/types'

// ============================================
// Reset Password Action
// ============================================

export type ResetPasswordResult =
  | { ok: true }
  | { ok: false; error: string; code: 'VALIDATION' | 'EXPIRED' | 'INTERNAL' }

/**
 * Resets the user's password with a new one.
 * User must have clicked the reset link from their email first.
 *
 * @param _prevState - Previous state (required by useActionState)
 * @param formData - Form data with new password
 * @returns Result or redirects to login on success
 */
export async function resetPassword(
  _prevState: ResetPasswordResult | null,
  formData: FormData
): Promise<ResetPasswordResult> {
  // 1. Parse and validate input
  const rawInput = {
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  }

  const parsed = resetPasswordSchema.safeParse(rawInput)

  if (!parsed.success) {
    const errors = parsed.error.errors.map((e) => e.message).join(', ')
    return {
      ok: false,
      error: errors,
      code: 'VALIDATION',
    }
  }

  // 2. Update password
  const supabase = await createClient()

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  })

  if (error) {
    console.error('[resetPassword] Error:', error.message)

    if (error.message.includes('expired') || error.message.includes('invalid')) {
      return {
        ok: false,
        error: 'Password reset link has expired. Please request a new one.',
        code: 'EXPIRED',
      }
    }

    return {
      ok: false,
      error: 'Failed to reset password. Please try again.',
      code: 'INTERNAL',
    }
  }

  // 3. Redirect to login on success
  redirect('/login?message=password-reset')
}

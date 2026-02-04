'use server'

import { createClient } from '@/lib/supabase/server'
import { forgotPasswordSchema } from '@/features/auth/types'

// ============================================
// Forgot Password Action
// ============================================

export type ForgotPasswordResult =
  | { ok: true; message: string }
  | { ok: false; error: string; code: 'VALIDATION' | 'INTERNAL' }

/**
 * Sends a password reset email to the user.
 *
 * @param _prevState - Previous state (required by useActionState)
 * @param formData - Form data with email
 * @returns Result with success message or error
 */
export async function forgotPassword(
  _prevState: ForgotPasswordResult | null,
  formData: FormData
): Promise<ForgotPasswordResult> {
  // 1. Parse and validate input
  const rawInput = {
    email: formData.get('email'),
  }

  const parsed = forgotPasswordSchema.safeParse(rawInput)

  if (!parsed.success) {
    const errors = parsed.error.errors.map((e) => e.message).join(', ')
    return {
      ok: false,
      error: errors,
      code: 'VALIDATION',
    }
  }

  // 2. Send password reset email
  const supabase = await createClient()

  // Get the site URL for the redirect
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${siteUrl}/reset-password`,
  })

  if (error) {
    console.error('[forgotPassword] Error:', error.message)
    // Don't reveal if email exists or not for security
    // Always return success message
  }

  // 3. Always return success to prevent email enumeration
  return {
    ok: true,
    message: 'If an account with that email exists, you will receive a password reset link.',
  }
}

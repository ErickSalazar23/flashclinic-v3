'use server'

import { createClient } from '@/lib/supabase/server'
import { magicLinkSchema } from '@/features/auth/types'

// ============================================
// Send Magic Link Action
// ============================================

export type SendMagicLinkResult =
  | { ok: true; message: string }
  | { ok: false; error: string; code: 'VALIDATION' | 'RATE_LIMITED' | 'INTERNAL' }

/**
 * Sends a magic link to the user's email for passwordless login.
 *
 * @param _prevState - Previous state (required by useActionState)
 * @param formData - Form data with email
 * @returns Result indicating success or failure
 */
export async function sendMagicLink(
  _prevState: SendMagicLinkResult | null,
  formData: FormData
): Promise<SendMagicLinkResult> {
  // 1. Parse and validate input
  const rawInput = {
    email: formData.get('email'),
  }

  const parsed = magicLinkSchema.safeParse(rawInput)

  if (!parsed.success) {
    const errors = parsed.error.errors.map((e) => e.message).join(', ')
    return {
      ok: false,
      error: errors,
      code: 'VALIDATION',
    }
  }

  // 2. Send magic link via Supabase
  const supabase = await createClient()

  const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`

  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      emailRedirectTo: redirectUrl,
    },
  })

  if (error) {
    console.error('[sendMagicLink] Auth error:', error.message)

    if (error.message.includes('rate limit') || error.message.includes('too many')) {
      return {
        ok: false,
        error: 'Too many requests. Please try again in a few minutes.',
        code: 'RATE_LIMITED',
      }
    }

    return {
      ok: false,
      error: 'Failed to send magic link. Please try again.',
      code: 'INTERNAL',
    }
  }

  // 3. Return success
  return {
    ok: true,
    message: 'Check your email for the magic link to sign in.',
  }
}

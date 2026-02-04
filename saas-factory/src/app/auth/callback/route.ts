import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// ============================================
// Auth Callback Route
// ============================================

/**
 * Handles the callback from Supabase auth (magic link, OAuth, etc.)
 * Exchanges the code for a session and redirects to dashboard.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }

    console.error('[auth/callback] Error exchanging code:', error.message)
  }

  // Return to login with error if something went wrong
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}

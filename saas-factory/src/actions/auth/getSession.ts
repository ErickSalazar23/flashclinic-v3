'use server'

import { createClient } from '@/lib/supabase/server'

// ============================================
// Get Session Action
// ============================================

export type GetSessionResult = {
  user: {
    id: string
    email: string | null
    fullName: string | null
  } | null
  isAuthenticated: boolean
}

/**
 * Gets the current user session.
 *
 * @returns Session info with user data or null
 */
export async function getSession(): Promise<GetSessionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      user: null,
      isAuthenticated: false,
    }
  }

  return {
    user: {
      id: user.id,
      email: user.email ?? null,
      fullName: (user.user_metadata?.full_name as string) ?? null,
    },
    isAuthenticated: true,
  }
}

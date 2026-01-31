'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// ============================================
// Logout Action
// ============================================

/**
 * Signs out the current user and redirects to login.
 */
export async function logout(): Promise<never> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

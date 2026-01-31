'use server'

import { createClient } from '@/lib/supabase/server'
import type { DomainEvent } from '@/features/events/types'

// ============================================
// Get Domain Event Server Action
// ============================================

export type GetEventResult =
  | { ok: true; data: DomainEvent }
  | { ok: false; error: string; code: 'NOT_FOUND' | 'UNAUTHORIZED' | 'INTERNAL' }

/**
 * Gets a single domain event by ID.
 *
 * @param eventId - The event UUID
 * @returns Result with the event or error
 */
export async function getEvent(eventId: string): Promise<GetEventResult> {
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

  const { data, error } = await supabase
    .from('domain_events')
    .select('*')
    .eq('id', eventId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return {
        ok: false,
        error: 'Event not found',
        code: 'NOT_FOUND',
      }
    }
    console.error('[getEvent] Query error:', error)
    return {
      ok: false,
      error: 'Failed to fetch event',
      code: 'INTERNAL',
    }
  }

  return {
    ok: true,
    data: data as DomainEvent,
  }
}

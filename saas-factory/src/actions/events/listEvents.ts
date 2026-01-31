'use server'

import { createClient } from '@/lib/supabase/server'
import type { DomainEvent, AggregateType, EventType } from '@/features/events/types'

// ============================================
// List Domain Events Server Action
// ============================================

export interface ListEventsFilters {
  /** Filter by aggregate type */
  aggregate_type?: AggregateType
  /** Filter by aggregate ID */
  aggregate_id?: string
  /** Filter by event type */
  event_type?: EventType
  /** Filter by event types (multiple) */
  event_types?: EventType[]
  /** Filter events after this date */
  after?: string
  /** Filter events before this date */
  before?: string
  /** Pagination limit */
  limit?: number
  /** Pagination offset */
  offset?: number
}

export type ListEventsResult =
  | { ok: true; data: DomainEvent[]; total: number }
  | { ok: false; error: string; code: 'UNAUTHORIZED' | 'INTERNAL' }

/**
 * Lists domain events with optional filters.
 * Events are sorted by created_at descending (newest first).
 *
 * @param filters - Optional filters for the query
 * @returns Result with events array and total count
 */
export async function listEvents(
  filters: ListEventsFilters = {}
): Promise<ListEventsResult> {
  const {
    aggregate_type,
    aggregate_id,
    event_type,
    event_types,
    after,
    before,
    limit = 50,
    offset = 0,
  } = filters

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

  // Build query
  let query = supabase
    .from('domain_events')
    .select('*', { count: 'exact' })

  // Apply filters
  if (aggregate_type) {
    query = query.eq('aggregate_type', aggregate_type)
  }

  if (aggregate_id) {
    query = query.eq('aggregate_id', aggregate_id)
  }

  if (event_type) {
    query = query.eq('event_type', event_type)
  }

  if (event_types && event_types.length > 0) {
    query = query.in('event_type', event_types)
  }

  if (after) {
    query = query.gte('created_at', after)
  }

  if (before) {
    query = query.lte('created_at', before)
  }

  // Apply ordering and pagination
  query = query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  const { data, error, count } = await query

  if (error) {
    console.error('[listEvents] Query error:', error)
    return {
      ok: false,
      error: 'Failed to fetch events',
      code: 'INTERNAL',
    }
  }

  return {
    ok: true,
    data: (data || []) as DomainEvent[],
    total: count || 0,
  }
}

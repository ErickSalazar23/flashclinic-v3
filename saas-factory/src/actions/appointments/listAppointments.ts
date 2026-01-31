'use server'

import { createClient } from '@/lib/supabase/server'
import { listAppointmentsQuerySchema, type Appointment, type ListAppointmentsQuery } from '@/features/appointments/types'

// ============================================
// List Appointments Action
// ============================================

export type ListAppointmentsResult =
  | { ok: true; data: Appointment[]; total: number }
  | { ok: false; error: string; code: 'VALIDATION' | 'UNAUTHORIZED' | 'INTERNAL' }

/**
 * Lists appointments with optional filtering and pagination.
 *
 * @param query - Query parameters
 * @returns Result with appointments array and total count
 */
export async function listAppointments(
  query?: Partial<ListAppointmentsQuery>
): Promise<ListAppointmentsResult> {
  // 1. Parse and validate query
  const parsed = listAppointmentsQuerySchema.safeParse(query ?? {})

  if (!parsed.success) {
    const errors = parsed.error.errors.map((e) => e.message).join(', ')
    return {
      ok: false,
      error: errors,
      code: 'VALIDATION',
    }
  }

  const { patient_id, status, priority, from_date, to_date, limit, offset } = parsed.data

  // 2. Auth check
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

  // 3. Build query
  let queryBuilder = supabase
    .from('appointments')
    .select('*', { count: 'exact' })

  // Apply filters
  if (patient_id) {
    queryBuilder = queryBuilder.eq('patient_id', patient_id)
  }

  if (status) {
    queryBuilder = queryBuilder.eq('status', status)
  }

  if (priority) {
    queryBuilder = queryBuilder.eq('priority', priority)
  }

  if (from_date) {
    queryBuilder = queryBuilder.gte('scheduled_at', from_date)
  }

  if (to_date) {
    queryBuilder = queryBuilder.lte('scheduled_at', to_date)
  }

  // Apply pagination and ordering
  queryBuilder = queryBuilder
    .order('scheduled_at', { ascending: true })
    .range(offset, offset + limit - 1)

  // 4. Execute query
  const { data, error, count } = await queryBuilder

  if (error) {
    console.error('[listAppointments] Database error:', error)
    return {
      ok: false,
      error: 'Failed to fetch appointments',
      code: 'INTERNAL',
    }
  }

  return {
    ok: true,
    data: data as Appointment[],
    total: count ?? 0,
  }
}

/**
 * Lists appointments with patient details.
 */
export async function listAppointmentsWithPatients(
  query?: Partial<ListAppointmentsQuery>
): Promise<
  | { ok: true; data: (Appointment & { patient: { full_name: string; email: string } })[]; total: number }
  | { ok: false; error: string; code: 'VALIDATION' | 'UNAUTHORIZED' | 'INTERNAL' }
> {
  // 1. Parse and validate query
  const parsed = listAppointmentsQuerySchema.safeParse(query ?? {})

  if (!parsed.success) {
    const errors = parsed.error.errors.map((e) => e.message).join(', ')
    return {
      ok: false,
      error: errors,
      code: 'VALIDATION',
    }
  }

  const { patient_id, status, priority, from_date, to_date, limit, offset } = parsed.data

  // 2. Auth check
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

  // 3. Build query with patient join
  let queryBuilder = supabase
    .from('appointments')
    .select(`
      *,
      patient:patients(full_name, email)
    `, { count: 'exact' })

  // Apply filters
  if (patient_id) {
    queryBuilder = queryBuilder.eq('patient_id', patient_id)
  }

  if (status) {
    queryBuilder = queryBuilder.eq('status', status)
  }

  if (priority) {
    queryBuilder = queryBuilder.eq('priority', priority)
  }

  if (from_date) {
    queryBuilder = queryBuilder.gte('scheduled_at', from_date)
  }

  if (to_date) {
    queryBuilder = queryBuilder.lte('scheduled_at', to_date)
  }

  // Apply pagination and ordering
  queryBuilder = queryBuilder
    .order('scheduled_at', { ascending: true })
    .range(offset, offset + limit - 1)

  // 4. Execute query
  const { data, error, count } = await queryBuilder

  if (error) {
    console.error('[listAppointmentsWithPatients] Database error:', error)
    return {
      ok: false,
      error: 'Failed to fetch appointments',
      code: 'INTERNAL',
    }
  }

  return {
    ok: true,
    data: data as (Appointment & { patient: { full_name: string; email: string } })[],
    total: count ?? 0,
  }
}

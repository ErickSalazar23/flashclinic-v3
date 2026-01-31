'use server'

import { createClient } from '@/lib/supabase/server'
import { listPatientsQuerySchema, type Patient, type ListPatientsQuery } from '@/features/patients/types'

// ============================================
// List Patients Action
// ============================================

export type ListPatientsResult =
  | { ok: true; data: Patient[]; total: number }
  | { ok: false; error: string; code: 'VALIDATION' | 'UNAUTHORIZED' | 'INTERNAL' }

/**
 * Lists patients with optional filtering and pagination.
 *
 * @param query - Query parameters
 * @returns Result with patients array and total count
 */
export async function listPatients(
  query?: Partial<ListPatientsQuery>
): Promise<ListPatientsResult> {
  // 1. Parse and validate query
  const parsed = listPatientsQuerySchema.safeParse(query ?? {})

  if (!parsed.success) {
    const errors = parsed.error.errors.map((e) => e.message).join(', ')
    return {
      ok: false,
      error: errors,
      code: 'VALIDATION',
    }
  }

  const { search, is_recurring, limit, offset } = parsed.data

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
    .from('patients')
    .select('*', { count: 'exact' })

  // Apply search filter
  if (search) {
    queryBuilder = queryBuilder.or(
      `full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`
    )
  }

  // Apply is_recurring filter
  if (is_recurring !== undefined) {
    queryBuilder = queryBuilder.eq('is_recurring', is_recurring)
  }

  // Apply pagination
  queryBuilder = queryBuilder
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  // 4. Execute query
  const { data, error, count } = await queryBuilder

  if (error) {
    console.error('[listPatients] Database error:', error)
    return {
      ok: false,
      error: 'Failed to fetch patients',
      code: 'INTERNAL',
    }
  }

  return {
    ok: true,
    data: data as Patient[],
    total: count ?? 0,
  }
}

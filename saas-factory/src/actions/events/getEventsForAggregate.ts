'use server'

import { createClient } from '@/lib/supabase/server'
import type { DomainEvent, AggregateType } from '@/features/events/types'

// ============================================
// Get Events for Aggregate Server Action
// ============================================

export type GetEventsForAggregateResult =
  | { ok: true; data: DomainEvent[] }
  | { ok: false; error: string; code: 'UNAUTHORIZED' | 'INTERNAL' }

/**
 * Gets all domain events for a specific aggregate (entity).
 * Returns events in chronological order (oldest first) for auditing.
 *
 * @param aggregateType - The type of aggregate (PATIENT, APPOINTMENT, PENDING_DECISION)
 * @param aggregateId - The aggregate UUID
 * @returns Result with events array ordered chronologically
 */
export async function getEventsForAggregate(
  aggregateType: AggregateType,
  aggregateId: string
): Promise<GetEventsForAggregateResult> {
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
    .eq('aggregate_type', aggregateType)
    .eq('aggregate_id', aggregateId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('[getEventsForAggregate] Query error:', error)
    return {
      ok: false,
      error: 'Failed to fetch events',
      code: 'INTERNAL',
    }
  }

  return {
    ok: true,
    data: (data || []) as DomainEvent[],
  }
}

/**
 * Gets the event history for an appointment.
 * Convenience wrapper for getEventsForAggregate.
 *
 * @param appointmentId - The appointment UUID
 * @returns Result with events array
 */
export async function getAppointmentHistory(
  appointmentId: string
): Promise<GetEventsForAggregateResult> {
  return getEventsForAggregate('APPOINTMENT', appointmentId)
}

/**
 * Gets the event history for a patient.
 * Convenience wrapper for getEventsForAggregate.
 *
 * @param patientId - The patient UUID
 * @returns Result with events array
 */
export async function getPatientHistory(
  patientId: string
): Promise<GetEventsForAggregateResult> {
  return getEventsForAggregate('PATIENT', patientId)
}

/**
 * Gets the event history for a pending decision.
 * Convenience wrapper for getEventsForAggregate.
 *
 * @param decisionId - The decision UUID
 * @returns Result with events array
 */
export async function getDecisionHistory(
  decisionId: string
): Promise<GetEventsForAggregateResult> {
  return getEventsForAggregate('PENDING_DECISION', decisionId)
}

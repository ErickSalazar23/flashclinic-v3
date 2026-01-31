import { createClient } from '@/lib/supabase/server'
import type { EventPublisherPort, TypedDomainEvent } from '../types'

// ============================================
// Supabase Event Publisher (Adapter)
// ============================================

type EventInput = Omit<TypedDomainEvent, 'id' | 'created_at'>

/**
 * Supabase-backed implementation of EventPublisherPort.
 * Publishes domain events to the domain_events table.
 *
 * Design principles:
 * - Idempotent: Uses UUID for deduplication
 * - Auditable: All events are append-only
 * - No side effects: Just persists events, doesn't execute handlers
 */
export class SupabaseEventPublisher implements EventPublisherPort {
  /**
   * Publish a single domain event
   */
  async publish(event: EventInput): Promise<void> {
    const supabase = await createClient()

    const { error } = await supabase.from('domain_events').insert({
      aggregate_type: event.aggregate_type,
      aggregate_id: event.aggregate_id,
      event_type: event.event_type,
      payload: event.payload,
    })

    if (error) {
      throw new Error(`Failed to publish event: ${error.message}`)
    }
  }

  /**
   * Publish multiple domain events atomically
   */
  async publishMany(events: EventInput[]): Promise<void> {
    if (events.length === 0) return

    const supabase = await createClient()

    const rows = events.map((event) => ({
      aggregate_type: event.aggregate_type,
      aggregate_id: event.aggregate_id,
      event_type: event.event_type,
      payload: event.payload,
    }))

    const { error } = await supabase.from('domain_events').insert(rows)

    if (error) {
      throw new Error(`Failed to publish events: ${error.message}`)
    }
  }
}

// ============================================
// Factory Function
// ============================================

let publisherInstance: SupabaseEventPublisher | null = null

/**
 * Get singleton instance of the event publisher
 */
export function getEventPublisher(): EventPublisherPort {
  if (!publisherInstance) {
    publisherInstance = new SupabaseEventPublisher()
  }
  return publisherInstance
}

// ============================================
// Helper Functions for Common Events
// ============================================

/**
 * Publish a patient created event
 */
export async function publishPatientCreated(
  patientId: string,
  payload: { full_name: string; email: string }
): Promise<void> {
  const publisher = getEventPublisher()
  await publisher.publish({
    aggregate_type: 'PATIENT',
    aggregate_id: patientId,
    event_type: 'PATIENT_CREATED',
    payload,
  })
}

/**
 * Publish an appointment created event
 */
export async function publishAppointmentCreated(
  appointmentId: string,
  payload: { patient_id: string; status: string; priority: string }
): Promise<void> {
  const publisher = getEventPublisher()
  await publisher.publish({
    aggregate_type: 'APPOINTMENT',
    aggregate_id: appointmentId,
    event_type: 'APPOINTMENT_CREATED',
    payload,
  })
}

/**
 * Publish an appointment confirmed event
 */
export async function publishAppointmentConfirmed(
  appointmentId: string,
  payload: { patient_id: string; previous_status: string; confirmed_by?: string }
): Promise<void> {
  const publisher = getEventPublisher()
  await publisher.publish({
    aggregate_type: 'APPOINTMENT',
    aggregate_id: appointmentId,
    event_type: 'APPOINTMENT_CONFIRMED',
    payload,
  })
}

/**
 * Publish an appointment rescheduled event
 */
export async function publishAppointmentRescheduled(
  appointmentId: string,
  payload: {
    patient_id: string
    new_scheduled_at: string
    previous_scheduled_at?: string
    rescheduled_by?: string
    reason?: string
  }
): Promise<void> {
  const publisher = getEventPublisher()
  await publisher.publish({
    aggregate_type: 'APPOINTMENT',
    aggregate_id: appointmentId,
    event_type: 'APPOINTMENT_RESCHEDULED',
    payload,
  })
}

/**
 * Publish an appointment attended event
 */
export async function publishAppointmentAttended(
  appointmentId: string,
  payload: { patient_id: string; attended_at: string; marked_by?: string }
): Promise<void> {
  const publisher = getEventPublisher()
  await publisher.publish({
    aggregate_type: 'APPOINTMENT',
    aggregate_id: appointmentId,
    event_type: 'APPOINTMENT_ATTENDED',
    payload,
  })
}

/**
 * Publish an appointment no-show event
 */
export async function publishAppointmentNoShow(
  appointmentId: string,
  payload: { patient_id: string; scheduled_at: string; marked_by?: string }
): Promise<void> {
  const publisher = getEventPublisher()
  await publisher.publish({
    aggregate_type: 'APPOINTMENT',
    aggregate_id: appointmentId,
    event_type: 'APPOINTMENT_NO_SHOW',
    payload,
  })
}

/**
 * Publish an appointment cancelled event
 */
export async function publishAppointmentCancelled(
  appointmentId: string,
  payload: { patient_id: string; cancelled_by?: string; reason?: string }
): Promise<void> {
  const publisher = getEventPublisher()
  await publisher.publish({
    aggregate_type: 'APPOINTMENT',
    aggregate_id: appointmentId,
    event_type: 'APPOINTMENT_CANCELLED',
    payload,
  })
}

/**
 * Publish an appointment priority changed event
 */
export async function publishAppointmentPriorityChanged(
  appointmentId: string,
  payload: {
    previous_priority: string
    new_priority: string
    changed_by?: string
    justification?: string
  }
): Promise<void> {
  const publisher = getEventPublisher()
  await publisher.publish({
    aggregate_type: 'APPOINTMENT',
    aggregate_id: appointmentId,
    event_type: 'APPOINTMENT_PRIORITY_CHANGED',
    payload,
  })
}

/**
 * Publish a decision created event
 */
export async function publishDecisionCreated(
  decisionId: string,
  payload: { reference_type: string; reference_id: string; weight: string; reason: string }
): Promise<void> {
  const publisher = getEventPublisher()
  await publisher.publish({
    aggregate_type: 'PENDING_DECISION',
    aggregate_id: decisionId,
    event_type: 'DECISION_CREATED',
    payload,
  })
}

/**
 * Publish a decision approved event
 */
export async function publishDecisionApproved(
  decisionId: string,
  payload: {
    resolved_by: string
    resolution_notes?: string
    created_appointment_id?: string
    patient_id?: string
  }
): Promise<void> {
  const publisher = getEventPublisher()
  await publisher.publish({
    aggregate_type: 'PENDING_DECISION',
    aggregate_id: decisionId,
    event_type: 'DECISION_APPROVED',
    payload,
  })
}

/**
 * Publish a decision rejected event
 */
export async function publishDecisionRejected(
  decisionId: string,
  payload: {
    resolved_by: string
    resolution_notes: string
    reference_type: string
    reference_id: string
  }
): Promise<void> {
  const publisher = getEventPublisher()
  await publisher.publish({
    aggregate_type: 'PENDING_DECISION',
    aggregate_id: decisionId,
    event_type: 'DECISION_REJECTED',
    payload,
  })
}

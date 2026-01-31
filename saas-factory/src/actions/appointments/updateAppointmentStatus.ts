'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Appointment, AppointmentStatus, StatusHistoryEntry } from '@/features/appointments/types'
import { appointmentStateMachine, appendToHistory } from '@/features/appointments/domain'

// ============================================
// Update Appointment Status Action
// ============================================

export type UpdateStatusResult =
  | { ok: true; data: Appointment }
  | { ok: false; error: string; code: 'NOT_FOUND' | 'INVALID_TRANSITION' | 'UNAUTHORIZED' | 'INTERNAL' }

/**
 * Updates an appointment's status.
 * Validates the transition against the state machine.
 * Appends to status history for audit trail.
 *
 * @param id - The appointment ID
 * @param newStatus - The target status
 * @param reason - Optional reason for the transition
 * @returns Result with updated appointment or error
 */
export async function updateAppointmentStatus(
  id: string,
  newStatus: AppointmentStatus,
  reason?: string
): Promise<UpdateStatusResult> {
  // 1. Auth check
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

  // 2. Get current appointment
  const { data: current, error: fetchError } = await supabase
    .from('appointments')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError || !current) {
    return {
      ok: false,
      error: 'Appointment not found',
      code: 'NOT_FOUND',
    }
  }

  // 3. Validate transition with state machine
  const transitionResult = appointmentStateMachine.transition(
    current.status as AppointmentStatus,
    newStatus,
    reason,
    user.id
  )

  if (!transitionResult.ok) {
    return {
      ok: false,
      error: transitionResult.error,
      code: 'INVALID_TRANSITION',
    }
  }

  // 4. Append to status history
  const existingHistory = (current.status_history || []) as StatusHistoryEntry[]
  const newHistory = appendToHistory(existingHistory, transitionResult.historyEntry)

  // 5. Update status and history
  const { data: updated, error: updateError } = await supabase
    .from('appointments')
    .update({
      status: newStatus,
      status_history: newHistory,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (updateError) {
    console.error('[updateAppointmentStatus] Database error:', updateError)
    return {
      ok: false,
      error: 'Failed to update appointment',
      code: 'INTERNAL',
    }
  }

  // 6. Emit domain event
  await supabase.from('domain_events').insert({
    aggregate_type: 'APPOINTMENT',
    aggregate_id: id,
    event_type: `APPOINTMENT_${newStatus}`,
    payload: {
      previous_status: current.status,
      new_status: newStatus,
      patient_id: current.patient_id,
      reason,
      updated_by: user.id,
    },
  })

  revalidatePath('/appointments')
  revalidatePath(`/appointments/${id}`)

  return {
    ok: true,
    data: updated as Appointment,
  }
}

// ============================================
// Specific Transition Actions
// ============================================

/**
 * Confirms an appointment (REQUESTED | RESCHEDULED → CONFIRMED).
 */
export async function confirmAppointment(
  id: string,
  reason?: string
): Promise<UpdateStatusResult> {
  return updateAppointmentStatus(id, 'CONFIRMED', reason || 'Appointment confirmed')
}

/**
 * Cancels an appointment (any non-terminal → CANCELLED).
 */
export async function cancelAppointment(
  id: string,
  reason?: string
): Promise<UpdateStatusResult> {
  return updateAppointmentStatus(id, 'CANCELLED', reason || 'Appointment cancelled')
}

/**
 * Reschedules an appointment (CONFIRMED → RESCHEDULED).
 * Note: The new scheduled_at should be updated separately via updateAppointment.
 */
export async function rescheduleAppointment(
  id: string,
  reason?: string
): Promise<UpdateStatusResult> {
  return updateAppointmentStatus(id, 'RESCHEDULED', reason || 'Appointment rescheduled')
}

/**
 * Marks an appointment as attended (CONFIRMED → ATTENDED).
 */
export async function markAsAttended(
  id: string,
  reason?: string
): Promise<UpdateStatusResult> {
  return updateAppointmentStatus(id, 'ATTENDED', reason || 'Patient attended')
}

/**
 * Marks an appointment as no-show (CONFIRMED → NO_SHOW).
 */
export async function markAsNoShow(
  id: string,
  reason?: string
): Promise<UpdateStatusResult> {
  return updateAppointmentStatus(id, 'NO_SHOW', reason || 'Patient did not show')
}

// ============================================
// Batch Operations
// ============================================

export type BatchUpdateResult = {
  succeeded: string[]
  failed: { id: string; error: string }[]
}

/**
 * Cancels multiple appointments.
 */
export async function cancelMultipleAppointments(
  ids: string[],
  reason?: string
): Promise<BatchUpdateResult> {
  const results: BatchUpdateResult = { succeeded: [], failed: [] }

  for (const id of ids) {
    const result = await cancelAppointment(id, reason)
    if (result.ok) {
      results.succeeded.push(id)
    } else {
      results.failed.push({ id, error: result.error })
    }
  }

  return results
}

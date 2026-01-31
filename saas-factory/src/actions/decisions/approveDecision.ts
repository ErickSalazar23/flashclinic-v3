'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { PendingDecision } from '@/features/decisions/types'
import type { Appointment } from '@/features/appointments/types'
import { createStatusHistoryEntry } from '@/features/appointments/types'

// ============================================
// Approve Decision Server Action
// ============================================

export type ApproveDecisionResult =
  | { ok: true; decision: PendingDecision; appointment: Appointment; alreadyApproved: false }
  | { ok: true; decision: PendingDecision; alreadyApproved: true }
  | { ok: false; error: string; code: 'NOT_FOUND' | 'ALREADY_REJECTED' | 'UNAUTHORIZED' | 'INTERNAL' }

/**
 * Approves a pending decision and creates the associated appointment.
 *
 * Idempotency:
 * - If already approved: returns success with alreadyApproved: true
 * - If already rejected: returns error with code ALREADY_REJECTED
 *
 * @param decisionId - The pending decision ID
 * @param notes - Optional approval notes
 * @returns Result with decision and created appointment
 */
export async function approveDecision(
  decisionId: string,
  notes?: string
): Promise<ApproveDecisionResult> {
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

  // 2. Get the pending decision
  const { data: decision, error: fetchError } = await supabase
    .from('pending_decisions')
    .select('*')
    .eq('id', decisionId)
    .single()

  if (fetchError || !decision) {
    return {
      ok: false,
      error: 'Decision not found',
      code: 'NOT_FOUND',
    }
  }

  // 3. Idempotency check
  if (decision.resolved_at !== null) {
    if (decision.resolution_type === 'APPROVED') {
      // Already approved - idempotent success
      return {
        ok: true,
        decision: decision as PendingDecision,
        alreadyApproved: true,
      }
    } else {
      // Already rejected - cannot approve
      return {
        ok: false,
        error: 'Decision was already rejected and cannot be approved',
        code: 'ALREADY_REJECTED',
      }
    }
  }

  // 4. Parse appointment data from decision
  const appointmentData = decision.appointment_data as Record<string, unknown> | null

  if (!appointmentData || decision.reference_type !== 'APPOINTMENT') {
    return {
      ok: false,
      error: 'No appointment data found in decision',
      code: 'INTERNAL',
    }
  }

  // 5. Create the appointment
  const initialHistoryEntry = createStatusHistoryEntry(
    'CONFIRMED',
    `Approved by human reviewer${notes ? `: ${notes}` : ''}`,
    user.id
  )

  const { data: appointment, error: appointmentError } = await supabase
    .from('appointments')
    .insert({
      patient_id: appointmentData.patient_id,
      scheduled_at: appointmentData.scheduled_at,
      reason: appointmentData.reason,
      specialty: appointmentData.specialty,
      notes: appointmentData.notes || null,
      status: 'CONFIRMED', // Approved appointments start as CONFIRMED
      priority: appointmentData.priority || 'LOW',
      status_history: [initialHistoryEntry],
    })
    .select()
    .single()

  if (appointmentError) {
    console.error('[approveDecision] Failed to create appointment:', appointmentError)
    return {
      ok: false,
      error: 'Failed to create appointment',
      code: 'INTERNAL',
    }
  }

  // 6. Update the decision as resolved
  const { data: updatedDecision, error: updateError } = await supabase
    .from('pending_decisions')
    .update({
      resolved_at: new Date().toISOString(),
      resolved_by: user.id,
      resolution_type: 'APPROVED',
      resolution_notes: notes || null,
      created_appointment_id: appointment.id,
    })
    .eq('id', decisionId)
    .select()
    .single()

  if (updateError) {
    console.error('[approveDecision] Failed to update decision:', updateError)
    // Note: Appointment was already created, but decision update failed
    // In production, you'd want a transaction or compensation logic
    return {
      ok: false,
      error: 'Failed to update decision status',
      code: 'INTERNAL',
    }
  }

  // 7. Emit domain event
  await supabase.from('domain_events').insert({
    aggregate_type: 'PENDING_DECISION',
    aggregate_id: decisionId,
    event_type: 'DECISION_APPROVED',
    payload: {
      resolved_by: user.id,
      resolution_notes: notes,
      created_appointment_id: appointment.id,
      patient_id: appointmentData.patient_id,
    },
  })

  // 8. Check if patient should be marked as recurring
  const { count: appointmentCount } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('patient_id', appointmentData.patient_id as string)

  if (appointmentCount && appointmentCount >= 3) {
    await supabase
      .from('patients')
      .update({ is_recurring: true })
      .eq('id', appointmentData.patient_id as string)
      .eq('is_recurring', false) // Only update if not already recurring
  }

  revalidatePath('/decisions')
  revalidatePath('/appointments')

  return {
    ok: true,
    decision: updatedDecision as PendingDecision,
    appointment: appointment as Appointment,
    alreadyApproved: false,
  }
}

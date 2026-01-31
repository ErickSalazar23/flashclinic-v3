'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import {
  overridePrioritySchema,
  createHumanPriorityEntry,
  type Appointment,
  type AppointmentPriority,
  type PriorityHistoryEntry,
} from '@/features/appointments/types'
import { publishAppointmentPriorityChanged } from '@/features/events/services'

// ============================================
// Override Priority Server Action
// ============================================

export type OverridePriorityResult =
  | { ok: true; appointment: Appointment; alreadySamePriority: false }
  | { ok: true; appointment: Appointment; alreadySamePriority: true }
  | { ok: false; error: string; code: 'VALIDATION' | 'NOT_FOUND' | 'UNAUTHORIZED' | 'TERMINAL' | 'INTERNAL' }

/**
 * Overrides the priority of an appointment with human justification.
 *
 * Features:
 * - Requires authentication
 * - Requires minimum 10 character justification
 * - Records full audit trail in priority_history
 * - Publishes APPOINTMENT_PRIORITY_CHANGED event
 * - Idempotent: returns success if already at requested priority
 *
 * @param input - The priority override input (appointment_id, new_priority, justification)
 * @returns Result with updated appointment or error
 */
export async function overridePriority(
  input: {
    appointment_id: string
    new_priority: AppointmentPriority
    justification: string
  }
): Promise<OverridePriorityResult> {
  // 1. Validate input
  const parsed = overridePrioritySchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.errors[0]?.message || 'Invalid input',
      code: 'VALIDATION',
    }
  }

  const { appointment_id, new_priority, justification } = parsed.data

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

  // 3. Get current appointment
  const { data: appointment, error: fetchError } = await supabase
    .from('appointments')
    .select('*')
    .eq('id', appointment_id)
    .single()

  if (fetchError || !appointment) {
    return {
      ok: false,
      error: 'Appointment not found',
      code: 'NOT_FOUND',
    }
  }

  // 4. Check if appointment is in terminal state
  const terminalStatuses = ['ATTENDED', 'NO_SHOW', 'CANCELLED']
  if (terminalStatuses.includes(appointment.status)) {
    return {
      ok: false,
      error: `Cannot change priority of ${appointment.status.toLowerCase()} appointment`,
      code: 'TERMINAL',
    }
  }

  // 5. Idempotency check - if already same priority, return success
  if (appointment.priority === new_priority) {
    return {
      ok: true,
      appointment: appointment as Appointment,
      alreadySamePriority: true,
    }
  }

  // 6. Create new priority history entry
  const currentHistory = (appointment.priority_history || []) as PriorityHistoryEntry[]
  const newEntry = createHumanPriorityEntry(
    new_priority,
    appointment.priority as AppointmentPriority,
    user.id,
    justification
  )
  const updatedHistory = [...currentHistory, newEntry]

  // 7. Update appointment
  const { data: updated, error: updateError } = await supabase
    .from('appointments')
    .update({
      priority: new_priority,
      priority_history: updatedHistory,
      updated_at: new Date().toISOString(),
    })
    .eq('id', appointment_id)
    .select()
    .single()

  if (updateError || !updated) {
    console.error('[overridePriority] Update error:', updateError)
    return {
      ok: false,
      error: 'Failed to update appointment priority',
      code: 'INTERNAL',
    }
  }

  // 8. Publish domain event
  try {
    await publishAppointmentPriorityChanged(appointment_id, {
      previous_priority: appointment.priority,
      new_priority,
      changed_by: user.id,
      justification,
    })
  } catch (eventError) {
    // Log but don't fail the operation
    console.error('[overridePriority] Event publish error:', eventError)
  }

  // 9. Revalidate cache
  revalidatePath('/appointments')
  revalidatePath(`/appointments/${appointment_id}`)

  return {
    ok: true,
    appointment: updated as Appointment,
    alreadySamePriority: false,
  }
}

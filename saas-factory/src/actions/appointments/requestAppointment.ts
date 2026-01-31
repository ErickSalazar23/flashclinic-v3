'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requestAppointmentSchema, type Appointment, daysUntilAppointment, createStatusHistoryEntry } from '@/features/appointments/types'
import { calculatePriority, detectAmbiguity } from '@/features/appointments/domain'
import { calculateAge } from '@/features/patients/types'
import { evaluate } from '@/features/decisions/engine'
import type { PendingDecision } from '@/features/decisions/types'

// ============================================
// Request Appointment Action
// ============================================

export type RequestAppointmentResult =
  | { ok: true; data: Appointment; pending: false }
  | { ok: true; pendingDecision: PendingDecision; pending: true; reason: string }
  | { ok: false; error: string; code: 'VALIDATION' | 'PATIENT_NOT_FOUND' | 'UNAUTHORIZED' | 'INTERNAL' }

/**
 * Requests a new appointment.
 *
 * This action integrates with the decision engine to determine if:
 * - The appointment can be created automatically (AUTOMATIC)
 * - Human review is needed (SUPERVISED/BLOCKED)
 *
 * @param formData - Form data with appointment fields
 * @returns Result with appointment or pending decision
 */
export async function requestAppointment(formData: FormData): Promise<RequestAppointmentResult> {
  // 1. Parse and validate input
  const rawInput = {
    patient_id: formData.get('patient_id'),
    scheduled_at: formData.get('scheduled_at'),
    reason: formData.get('reason'),
    specialty: formData.get('specialty'),
    notes: formData.get('notes') || undefined,
  }

  const parsed = requestAppointmentSchema.safeParse(rawInput)

  if (!parsed.success) {
    const errors = parsed.error.errors.map((e) => e.message).join(', ')
    return {
      ok: false,
      error: errors,
      code: 'VALIDATION',
    }
  }

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

  // 3. Get patient data for decision engine
  const { data: patient, error: patientError } = await supabase
    .from('patients')
    .select('*')
    .eq('id', parsed.data.patient_id)
    .single()

  if (patientError || !patient) {
    return {
      ok: false,
      error: 'Patient not found',
      code: 'PATIENT_NOT_FOUND',
    }
  }

  // 4. Calculate priority and check for ambiguity
  const waitTimeDays = daysUntilAppointment(parsed.data.scheduled_at)
  const patientAge = patient.birth_date ? calculateAge(patient.birth_date) : 30

  const priorityResult = calculatePriority({
    reason: parsed.data.reason,
    patientAge,
    waitTimeDays,
  })

  const ambiguityCheck = detectAmbiguity({
    reason: parsed.data.reason,
    patientAge,
    waitTimeDays,
  })

  // 5. Evaluate with decision engine
  const decisionOutput = evaluate({
    referenceType: 'APPOINTMENT',
    referenceId: 'pending', // Will be replaced with actual ID
    appointment: {
      id: 'pending',
      patient_id: parsed.data.patient_id,
      scheduled_at: parsed.data.scheduled_at,
      reason: parsed.data.reason,
      specialty: parsed.data.specialty,
      status: 'CONFIRMED',
      priority: priorityResult.priority,
      created_at: new Date().toISOString(),
    },
    patient: {
      id: patient.id,
      full_name: patient.full_name,
      email: patient.email,
      phone: patient.phone || '',
      birth_date: patient.birth_date || '',
      is_recurring: patient.is_recurring || false,
      created_at: patient.created_at,
    },
  })

  // 6. If ambiguous or requires human decision, create pending decision
  const requiresHumanReview =
    ambiguityCheck.isAmbiguous ||
    decisionOutput.autonomyLevel !== 'AUTOMATIC'

  if (requiresHumanReview) {
    // Create pending decision with appointment data
    const reasons = [
      ...ambiguityCheck.reasons,
      ...decisionOutput.reasons,
    ]

    // Store appointment data for later approval
    const appointmentData = {
      patient_id: parsed.data.patient_id,
      scheduled_at: parsed.data.scheduled_at,
      reason: parsed.data.reason,
      specialty: parsed.data.specialty,
      notes: parsed.data.notes,
      priority: priorityResult.priority,
    }

    const { data: pendingDecision, error: decisionError } = await supabase
      .from('pending_decisions')
      .insert({
        reference_type: 'APPOINTMENT',
        reference_id: parsed.data.patient_id, // Use patient_id as reference until appointment is created
        weight: decisionOutput.weight,
        reason: reasons.join(' | '),
        autonomy_level: decisionOutput.autonomyLevel === 'AUTOMATIC' ? null : decisionOutput.autonomyLevel,
        appointment_data: appointmentData,
      })
      .select()
      .single()

    if (decisionError) {
      console.error('[requestAppointment] Failed to create pending decision:', decisionError)
      return {
        ok: false,
        error: 'Failed to create pending decision',
        code: 'INTERNAL',
      }
    }

    // Emit domain event
    await supabase.from('domain_events').insert({
      aggregate_type: 'PENDING_DECISION',
      aggregate_id: pendingDecision.id,
      event_type: 'DECISION_CREATED',
      payload: {
        patient_id: parsed.data.patient_id,
        autonomy_level: decisionOutput.autonomyLevel,
        weight: decisionOutput.weight,
        reasons,
      },
    })

    revalidatePath('/appointments')
    revalidatePath('/decisions')

    return {
      ok: true,
      pendingDecision: pendingDecision as PendingDecision,
      pending: true,
      reason: reasons[0] || 'Human review required',
    }
  }

  // 7. Create appointment directly (AUTOMATIC) with CONFIRMED status
  const initialHistoryEntry = createStatusHistoryEntry(
    'CONFIRMED',
    'Auto-approved by decision engine',
    user.id
  )

  const { data: appointment, error: appointmentError } = await supabase
    .from('appointments')
    .insert({
      patient_id: parsed.data.patient_id,
      scheduled_at: parsed.data.scheduled_at,
      reason: parsed.data.reason,
      specialty: parsed.data.specialty,
      notes: parsed.data.notes,
      status: 'CONFIRMED',
      priority: priorityResult.priority,
      status_history: [initialHistoryEntry],
    })
    .select()
    .single()

  if (appointmentError) {
    console.error('[requestAppointment] Database error:', appointmentError)
    return {
      ok: false,
      error: 'Failed to create appointment',
      code: 'INTERNAL',
    }
  }

  // 8. Check if patient should be marked as recurring
  const { count: appointmentCount } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('patient_id', parsed.data.patient_id)

  if (appointmentCount && appointmentCount >= 3 && !patient.is_recurring) {
    await supabase
      .from('patients')
      .update({ is_recurring: true })
      .eq('id', parsed.data.patient_id)
  }

  // 9. Emit domain event
  await supabase.from('domain_events').insert({
    aggregate_type: 'APPOINTMENT',
    aggregate_id: appointment.id,
    event_type: 'APPOINTMENT_CREATED',
    payload: {
      patient_id: parsed.data.patient_id,
      scheduled_at: parsed.data.scheduled_at,
      priority: priorityResult.priority,
      specialty: parsed.data.specialty,
    },
  })

  revalidatePath('/appointments')

  return {
    ok: true,
    data: appointment as Appointment,
    pending: false,
  }
}

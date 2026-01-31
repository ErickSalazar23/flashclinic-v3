import { z } from 'zod'

// ============================================
// Domain Events - Zod Schemas
// ============================================

export const aggregateTypeEnum = z.enum([
  'PATIENT',
  'APPOINTMENT',
  'PENDING_DECISION',
])

export const eventTypeEnum = z.enum([
  // Patient events
  'PATIENT_CREATED',
  'PATIENT_UPDATED',
  'PATIENT_DELETED',

  // Appointment events
  'APPOINTMENT_CREATED',
  'APPOINTMENT_CONFIRMED',
  'APPOINTMENT_RESCHEDULED',
  'APPOINTMENT_ATTENDED',
  'APPOINTMENT_NO_SHOW',
  'APPOINTMENT_CANCELLED',
  'APPOINTMENT_STATUS_CHANGED',
  'APPOINTMENT_PRIORITY_CHANGED',

  // Decision events
  'DECISION_CREATED',
  'DECISION_APPROVED',
  'DECISION_REJECTED',
  'DECISION_RESOLVED', // Generic resolved (deprecated, use APPROVED/REJECTED)
])

export const domainEventSchema = z.object({
  id: z.string().uuid(),
  aggregate_type: aggregateTypeEnum,
  aggregate_id: z.string().uuid(),
  event_type: eventTypeEnum,
  payload: z.record(z.unknown()),
  created_at: z.string().datetime(),
})

export const createDomainEventSchema = domainEventSchema.omit({
  id: true,
  created_at: true,
})

// ============================================
// Event Payload Schemas
// ============================================

export const patientCreatedPayloadSchema = z.object({
  full_name: z.string(),
  email: z.string().email(),
})

export const appointmentCreatedPayloadSchema = z.object({
  patient_id: z.string().uuid(),
  status: z.string(),
  priority: z.string(),
})

export const appointmentStatusChangedPayloadSchema = z.object({
  previous_status: z.string(),
  new_status: z.string(),
  patient_id: z.string().uuid(),
})

export const appointmentPriorityChangedPayloadSchema = z.object({
  previous_priority: z.string(),
  new_priority: z.string(),
  changed_by: z.string().uuid().optional(),
  justification: z.string().optional(),
})

export const decisionCreatedPayloadSchema = z.object({
  reference_type: z.string(),
  reference_id: z.string().uuid(),
  weight: z.string(),
  reason: z.string(),
})

export const decisionResolvedPayloadSchema = z.object({
  resolved_by: z.string().uuid(),
  resolution: z.enum(['APPROVED', 'REJECTED']),
})

// New appointment event payloads
export const appointmentConfirmedPayloadSchema = z.object({
  patient_id: z.string().uuid(),
  confirmed_by: z.string().uuid().optional(),
  previous_status: z.string(),
})

export const appointmentRescheduledPayloadSchema = z.object({
  patient_id: z.string().uuid(),
  previous_scheduled_at: z.string().datetime().optional(),
  new_scheduled_at: z.string().datetime(),
  rescheduled_by: z.string().uuid().optional(),
  reason: z.string().optional(),
})

export const appointmentAttendedPayloadSchema = z.object({
  patient_id: z.string().uuid(),
  attended_at: z.string().datetime(),
  marked_by: z.string().uuid().optional(),
})

export const appointmentNoShowPayloadSchema = z.object({
  patient_id: z.string().uuid(),
  scheduled_at: z.string().datetime(),
  marked_by: z.string().uuid().optional(),
})

export const appointmentCancelledPayloadSchema = z.object({
  patient_id: z.string().uuid(),
  cancelled_by: z.string().uuid().optional(),
  reason: z.string().optional(),
})

// Decision approval/rejection payloads
export const decisionApprovedPayloadSchema = z.object({
  resolved_by: z.string().uuid(),
  resolution_notes: z.string().optional(),
  created_appointment_id: z.string().uuid().optional(),
  patient_id: z.string().uuid().optional(),
})

export const decisionRejectedPayloadSchema = z.object({
  resolved_by: z.string().uuid(),
  resolution_notes: z.string(),
  reference_type: z.string(),
  reference_id: z.string().uuid(),
})

// ============================================
// Inferred Types
// ============================================

export type AggregateType = z.infer<typeof aggregateTypeEnum>
export type EventType = z.infer<typeof eventTypeEnum>
export type DomainEvent = z.infer<typeof domainEventSchema>
export type CreateDomainEventInput = z.infer<typeof createDomainEventSchema>

export type PatientCreatedPayload = z.infer<typeof patientCreatedPayloadSchema>
export type AppointmentCreatedPayload = z.infer<typeof appointmentCreatedPayloadSchema>
export type AppointmentStatusChangedPayload = z.infer<typeof appointmentStatusChangedPayloadSchema>
export type AppointmentPriorityChangedPayload = z.infer<typeof appointmentPriorityChangedPayloadSchema>
export type AppointmentConfirmedPayload = z.infer<typeof appointmentConfirmedPayloadSchema>
export type AppointmentRescheduledPayload = z.infer<typeof appointmentRescheduledPayloadSchema>
export type AppointmentAttendedPayload = z.infer<typeof appointmentAttendedPayloadSchema>
export type AppointmentNoShowPayload = z.infer<typeof appointmentNoShowPayloadSchema>
export type AppointmentCancelledPayload = z.infer<typeof appointmentCancelledPayloadSchema>
export type DecisionCreatedPayload = z.infer<typeof decisionCreatedPayloadSchema>
export type DecisionResolvedPayload = z.infer<typeof decisionResolvedPayloadSchema>
export type DecisionApprovedPayload = z.infer<typeof decisionApprovedPayloadSchema>
export type DecisionRejectedPayload = z.infer<typeof decisionRejectedPayloadSchema>

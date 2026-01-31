import { z } from 'zod'

// ============================================
// Appointments - Zod Schemas
// ============================================

/**
 * Full appointment status enum matching legacy state machine.
 *
 * State transitions:
 * - REQUESTED → [CONFIRMED, CANCELLED]
 * - CONFIRMED → [RESCHEDULED, ATTENDED, NO_SHOW, CANCELLED]
 * - RESCHEDULED → [CONFIRMED, CANCELLED]
 * - ATTENDED → (terminal)
 * - NO_SHOW → (terminal)
 * - CANCELLED → (terminal)
 */
export const appointmentStatusEnum = z.enum([
  'REQUESTED',    // Initial state - awaiting confirmation
  'CONFIRMED',    // Appointment confirmed
  'RESCHEDULED',  // Appointment rescheduled, awaiting re-confirmation
  'ATTENDED',     // Patient attended the appointment
  'NO_SHOW',      // Patient did not show up
  'CANCELLED',    // Appointment cancelled
])

export const appointmentPriorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH'])

/**
 * Validates scheduled_at is in the future.
 */
const scheduledAtSchema = z
  .string()
  .datetime()
  .refine(
    (val) => {
      const scheduled = new Date(val)
      const now = new Date()
      return scheduled > now
    },
    { message: 'Appointment must be scheduled in the future' }
  )

/**
 * A single entry in the status history.
 * Defined before appointmentSchema to avoid forward reference.
 */
export const statusHistoryEntrySchema = z.object({
  status: appointmentStatusEnum,
  occurred_at: z.string().datetime(),
  reason: z.string().optional(),
  changed_by: z.string().uuid().optional(), // User ID who made the change
})

export type StatusHistoryEntry = z.infer<typeof statusHistoryEntrySchema>

/**
 * Origin of priority change: SYSTEM (automatic) or HUMAN (manual override).
 */
export const priorityOriginEnum = z.enum(['SYSTEM', 'HUMAN'])

/**
 * A single entry in the priority history.
 */
export const priorityHistoryEntrySchema = z.object({
  priority: appointmentPriorityEnum,
  previous_priority: appointmentPriorityEnum.nullable(),
  origin: priorityOriginEnum,
  occurred_at: z.string().datetime(),
  changed_by: z.string().uuid().nullable(), // User ID who made the change (for HUMAN)
  justification: z.string().nullable(), // Required for HUMAN overrides
})

export type PriorityOrigin = z.infer<typeof priorityOriginEnum>
export type PriorityHistoryEntry = z.infer<typeof priorityHistoryEntrySchema>

/**
 * Full appointment schema.
 */
export const appointmentSchema = z.object({
  id: z.string().uuid(),
  patient_id: z.string().uuid(),
  scheduled_at: z.string().datetime(),
  reason: z.string().min(1, 'Reason is required'),
  specialty: z.string().min(1, 'Specialty is required'),
  status: appointmentStatusEnum,
  priority: appointmentPriorityEnum,
  notes: z.string().optional(),
  status_history: z.array(statusHistoryEntrySchema).optional(),
  priority_history: z.array(priorityHistoryEntrySchema).optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime().optional(),
})

/**
 * Schema for creating a new appointment.
 * Status defaults to REQUESTED (or CONFIRMED if auto-approved), priority is calculated by decision engine.
 */
export const createAppointmentSchema = z.object({
  patient_id: z.string().uuid(),
  scheduled_at: scheduledAtSchema,
  reason: z.string().min(5, 'Reason must be at least 5 characters'),
  specialty: z.string().min(1, 'Specialty is required'),
  priority: appointmentPriorityEnum.optional(), // Can be set by decision engine
  status: appointmentStatusEnum.optional(), // Defaults to REQUESTED
  notes: z.string().optional(),
})

/**
 * Schema for updating an appointment.
 */
export const updateAppointmentSchema = z.object({
  scheduled_at: scheduledAtSchema.optional(),
  reason: z.string().min(5).optional(),
  specialty: z.string().min(1).optional(),
  status: appointmentStatusEnum.optional(),
  priority: appointmentPriorityEnum.optional(),
  notes: z.string().optional(),
})

/**
 * Schema for appointment request (before decision engine evaluation).
 */
export const requestAppointmentSchema = z.object({
  patient_id: z.string().uuid(),
  scheduled_at: scheduledAtSchema,
  reason: z.string().min(5, 'Please describe the reason for your appointment'),
  specialty: z.string().min(1, 'Specialty is required'),
  notes: z.string().optional(),
})

// ============================================
// Query Schemas
// ============================================

export const listAppointmentsQuerySchema = z.object({
  patient_id: z.string().uuid().optional(),
  status: appointmentStatusEnum.optional(),
  priority: appointmentPriorityEnum.optional(),
  from_date: z.string().datetime().optional(),
  to_date: z.string().datetime().optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
})

// ============================================
// Status History Utilities
// ============================================

/**
 * Creates a new status history entry.
 */
export function createStatusHistoryEntry(
  status: AppointmentStatus,
  reason?: string,
  changedBy?: string
): StatusHistoryEntry {
  return {
    status,
    occurred_at: new Date().toISOString(),
    reason,
    changed_by: changedBy,
  }
}

// ============================================
// State Machine - Valid Transitions
// ============================================

/**
 * Valid status transitions based on legacy state machine.
 *
 * - REQUESTED: Initial state when appointment is first created
 * - CONFIRMED: Appointment has been confirmed by staff/system
 * - RESCHEDULED: Appointment date/time changed, awaiting re-confirmation
 * - ATTENDED: Patient successfully attended
 * - NO_SHOW: Patient did not show up
 * - CANCELLED: Appointment was cancelled
 */
export const VALID_STATUS_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  REQUESTED: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['RESCHEDULED', 'ATTENDED', 'NO_SHOW', 'CANCELLED'],
  RESCHEDULED: ['CONFIRMED', 'CANCELLED'],
  ATTENDED: [],    // Terminal state
  NO_SHOW: [],     // Terminal state
  CANCELLED: [],   // Terminal state
}

/**
 * Terminal states that cannot transition further.
 */
export const TERMINAL_STATUSES: AppointmentStatus[] = ['ATTENDED', 'NO_SHOW', 'CANCELLED']

/**
 * Checks if a status transition is valid.
 */
export function isValidTransition(
  from: AppointmentStatus,
  to: AppointmentStatus
): boolean {
  return VALID_STATUS_TRANSITIONS[from].includes(to)
}

/**
 * Checks if a status is terminal (no further transitions allowed).
 */
export function isTerminalStatus(status: AppointmentStatus): boolean {
  return VALID_STATUS_TRANSITIONS[status].length === 0
}

// ============================================
// Inferred Types
// ============================================

export type AppointmentStatus = z.infer<typeof appointmentStatusEnum>
export type AppointmentPriority = z.infer<typeof appointmentPriorityEnum>
export type Appointment = z.infer<typeof appointmentSchema>
export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>
export type RequestAppointmentInput = z.infer<typeof requestAppointmentSchema>
export type ListAppointmentsQuery = z.infer<typeof listAppointmentsQuerySchema>

// ============================================
// Utility Functions
// ============================================

/**
 * Calculates days until appointment.
 */
export function daysUntilAppointment(scheduledAt: string): number {
  const scheduled = new Date(scheduledAt)
  const now = new Date()
  const diffTime = scheduled.getTime() - now.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Formats appointment status for display.
 */
export function formatStatus(status: AppointmentStatus): string {
  const labels: Record<AppointmentStatus, string> = {
    REQUESTED: 'Requested',
    CONFIRMED: 'Confirmed',
    RESCHEDULED: 'Rescheduled',
    ATTENDED: 'Attended',
    NO_SHOW: 'No Show',
    CANCELLED: 'Cancelled',
  }
  return labels[status]
}

/**
 * Formats appointment priority for display.
 */
export function formatPriority(priority: AppointmentPriority): string {
  const labels: Record<AppointmentPriority, string> = {
    LOW: 'Low',
    MEDIUM: 'Medium',
    HIGH: 'High',
  }
  return labels[priority]
}

/**
 * Gets priority badge color classes.
 */
export function getPriorityColorClass(priority: AppointmentPriority): string {
  const colors: Record<AppointmentPriority, string> = {
    LOW: 'bg-gray-100 text-gray-800',
    MEDIUM: 'bg-yellow-100 text-yellow-800',
    HIGH: 'bg-red-100 text-red-800',
  }
  return colors[priority]
}

/**
 * Gets status badge color classes.
 */
export function getStatusColorClass(status: AppointmentStatus): string {
  const colors: Record<AppointmentStatus, string> = {
    REQUESTED: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    RESCHEDULED: 'bg-purple-100 text-purple-800',
    ATTENDED: 'bg-green-100 text-green-800',
    NO_SHOW: 'bg-red-100 text-red-800',
    CANCELLED: 'bg-gray-100 text-gray-800',
  }
  return colors[status]
}

// ============================================
// Priority Override Schema
// ============================================

/**
 * Schema for priority override request.
 */
export const overridePrioritySchema = z.object({
  appointment_id: z.string().uuid(),
  new_priority: appointmentPriorityEnum,
  justification: z.string().min(10, 'Justification must be at least 10 characters'),
})

export type OverridePriorityInput = z.infer<typeof overridePrioritySchema>

// ============================================
// Priority History Utilities
// ============================================

/**
 * Creates a priority history entry for system changes.
 */
export function createSystemPriorityEntry(
  priority: AppointmentPriority,
  previousPriority: AppointmentPriority | null
): PriorityHistoryEntry {
  return {
    priority,
    previous_priority: previousPriority,
    origin: 'SYSTEM',
    occurred_at: new Date().toISOString(),
    changed_by: null,
    justification: null,
  }
}

/**
 * Creates a priority history entry for human overrides.
 */
export function createHumanPriorityEntry(
  priority: AppointmentPriority,
  previousPriority: AppointmentPriority,
  changedBy: string,
  justification: string
): PriorityHistoryEntry {
  return {
    priority,
    previous_priority: previousPriority,
    origin: 'HUMAN',
    occurred_at: new Date().toISOString(),
    changed_by: changedBy,
    justification,
  }
}

/**
 * Gets the number of human overrides in the priority history.
 */
export function countHumanOverrides(history: PriorityHistoryEntry[]): number {
  return history.filter((entry) => entry.origin === 'HUMAN').length
}

/**
 * Gets the latest priority change from history.
 */
export function getLatestPriorityChange(
  history: PriorityHistoryEntry[]
): PriorityHistoryEntry | null {
  if (history.length === 0) return null
  return history[history.length - 1]
}

/**
 * Checks if the current priority was set by a human.
 */
export function isHumanOverridden(history: PriorityHistoryEntry[]): boolean {
  const latest = getLatestPriorityChange(history)
  return latest?.origin === 'HUMAN'
}

/**
 * Formats priority origin for display.
 */
export function formatPriorityOrigin(origin: PriorityOrigin): string {
  return origin === 'HUMAN' ? 'Manual Override' : 'System'
}

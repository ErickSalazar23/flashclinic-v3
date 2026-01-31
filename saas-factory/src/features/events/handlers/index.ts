import { getInternalDispatcher, createHandler } from '../services/eventDispatcher'
import type {
  PatientCreatedEvent,
  AppointmentCreatedEvent,
  AppointmentConfirmedEvent,
  AppointmentCancelledEvent,
  AppointmentAttendedEvent,
  AppointmentNoShowEvent,
  DecisionApprovedEvent,
  DecisionRejectedEvent,
} from '../types'

// ============================================
// Event Handlers - Isolated Side Effects
// ============================================

/**
 * Handler for patient created events
 * Example: Send welcome email, create initial records, etc.
 */
export const patientCreatedHandler = createHandler<PatientCreatedEvent>(
  'PATIENT_CREATED',
  async (event) => {
    // In production: Send welcome email, initialize patient portal, etc.
    console.log(`[Event] Patient created: ${event.payload.full_name}`)
  }
)

/**
 * Handler for appointment created events
 * Example: Send confirmation email, notify staff, etc.
 */
export const appointmentCreatedHandler = createHandler<AppointmentCreatedEvent>(
  'APPOINTMENT_CREATED',
  async (event) => {
    // In production: Send confirmation, add to calendar, notify relevant staff
    console.log(`[Event] Appointment created: ${event.aggregate_id} for patient ${event.payload.patient_id}`)
  }
)

/**
 * Handler for appointment confirmed events
 * Example: Send confirmation email to patient
 */
export const appointmentConfirmedHandler = createHandler<AppointmentConfirmedEvent>(
  'APPOINTMENT_CONFIRMED',
  async (event) => {
    // In production: Send confirmation email, update calendar status
    console.log(`[Event] Appointment confirmed: ${event.aggregate_id}`)
  }
)

/**
 * Handler for appointment attended events
 * Example: Update patient visit history, trigger billing
 */
export const appointmentAttendedHandler = createHandler<AppointmentAttendedEvent>(
  'APPOINTMENT_ATTENDED',
  async (event) => {
    // In production: Update visit history, trigger billing workflow
    console.log(`[Event] Appointment attended: ${event.aggregate_id}`)
  }
)

/**
 * Handler for appointment no-show events
 * Example: Update patient no-show count, send follow-up
 */
export const appointmentNoShowHandler = createHandler<AppointmentNoShowEvent>(
  'APPOINTMENT_NO_SHOW',
  async (event) => {
    // In production: Track no-shows, send follow-up communication
    console.log(`[Event] Appointment no-show: ${event.aggregate_id}`)
  }
)

/**
 * Handler for appointment cancelled events
 * Example: Free up slot, notify waitlist, send cancellation email
 */
export const appointmentCancelledHandler = createHandler<AppointmentCancelledEvent>(
  'APPOINTMENT_CANCELLED',
  async (event) => {
    // In production: Free slot, check waitlist, send cancellation confirmation
    console.log(`[Event] Appointment cancelled: ${event.aggregate_id}`, event.payload.reason)
  }
)

/**
 * Handler for decision approved events
 * Example: Notify patient of approved appointment, log audit
 */
export const decisionApprovedHandler = createHandler<DecisionApprovedEvent>(
  'DECISION_APPROVED',
  async (event) => {
    // In production: Notify patient, update dashboards, log audit
    console.log(`[Event] Decision approved: ${event.aggregate_id} by ${event.payload.resolved_by}`)
    if (event.payload.created_appointment_id) {
      console.log(`  -> Created appointment: ${event.payload.created_appointment_id}`)
    }
  }
)

/**
 * Handler for decision rejected events
 * Example: Notify patient of rejection, log reason
 */
export const decisionRejectedHandler = createHandler<DecisionRejectedEvent>(
  'DECISION_REJECTED',
  async (event) => {
    // In production: Notify patient of rejection, suggest alternatives
    console.log(`[Event] Decision rejected: ${event.aggregate_id} by ${event.payload.resolved_by}`)
    console.log(`  -> Reason: ${event.payload.resolution_notes}`)
  }
)

// ============================================
// Handler Registration
// ============================================

/**
 * Register all event handlers with the dispatcher
 * Call this during app initialization
 */
export function registerAllHandlers(): void {
  const dispatcher = getInternalDispatcher()

  // Patient handlers
  dispatcher.register(patientCreatedHandler)

  // Appointment handlers
  dispatcher.register(appointmentCreatedHandler)
  dispatcher.register(appointmentConfirmedHandler)
  dispatcher.register(appointmentAttendedHandler)
  dispatcher.register(appointmentNoShowHandler)
  dispatcher.register(appointmentCancelledHandler)

  // Decision handlers
  dispatcher.register(decisionApprovedHandler)
  dispatcher.register(decisionRejectedHandler)

  console.log('[EventSystem] All handlers registered')
}

/**
 * List of all handlers for testing/inspection
 */
export const allHandlers = [
  patientCreatedHandler,
  appointmentCreatedHandler,
  appointmentConfirmedHandler,
  appointmentAttendedHandler,
  appointmentNoShowHandler,
  appointmentCancelledHandler,
  decisionApprovedHandler,
  decisionRejectedHandler,
]

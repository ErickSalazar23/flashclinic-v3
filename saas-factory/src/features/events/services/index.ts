// Events - Services Exports
export {
  SupabaseEventPublisher,
  getEventPublisher,
  publishPatientCreated,
  publishAppointmentCreated,
  publishAppointmentConfirmed,
  publishAppointmentRescheduled,
  publishAppointmentAttended,
  publishAppointmentNoShow,
  publishAppointmentCancelled,
  publishAppointmentPriorityChanged,
  publishDecisionCreated,
  publishDecisionApproved,
  publishDecisionRejected,
} from './eventPublisher'

export {
  InMemoryEventDispatcher,
  getEventDispatcher,
  getInternalDispatcher,
  createHandler,
  dispatchEvent,
} from './eventDispatcher'

// Re-export handlers
export {
  registerAllHandlers,
  allHandlers,
  patientCreatedHandler,
  appointmentCreatedHandler,
  appointmentConfirmedHandler,
  appointmentAttendedHandler,
  appointmentNoShowHandler,
  appointmentCancelledHandler,
  decisionApprovedHandler,
  decisionRejectedHandler,
} from '../handlers'

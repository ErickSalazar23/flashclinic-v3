// Appointment Actions - Exports
export { requestAppointment, type RequestAppointmentResult } from './requestAppointment'
export { getAppointment, getAppointmentWithPatient, type GetAppointmentResult } from './getAppointment'
export { listAppointments, listAppointmentsWithPatients, type ListAppointmentsResult } from './listAppointments'
export {
  updateAppointmentStatus,
  confirmAppointment,
  cancelAppointment,
  rescheduleAppointment,
  markAsAttended,
  markAsNoShow,
  cancelMultipleAppointments,
  type UpdateStatusResult,
  type BatchUpdateResult,
} from './updateAppointmentStatus'
export { overridePriority, type OverridePriorityResult } from './overridePriority'

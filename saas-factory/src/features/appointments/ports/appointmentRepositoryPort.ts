import type {
  Appointment,
  CreateAppointmentInput,
  UpdateAppointmentInput,
  ListAppointmentsQuery,
  AppointmentStatus,
} from '../types'

// ============================================
// Appointment Repository Port
// ============================================

/**
 * Port for persisting and retrieving appointments.
 */
export interface AppointmentRepositoryPort {
  /**
   * Create a new appointment.
   *
   * @param input - The appointment data
   * @returns The created appointment
   */
  create(input: CreateAppointmentInput): Promise<Appointment>

  /**
   * Find an appointment by ID.
   *
   * @param id - The appointment ID
   * @returns The appointment or null if not found
   */
  findById(id: string): Promise<Appointment | null>

  /**
   * Find appointments by patient ID.
   *
   * @param patientId - The patient ID
   * @returns Array of appointments for this patient
   */
  findByPatientId(patientId: string): Promise<Appointment[]>

  /**
   * List appointments with optional filtering.
   *
   * @param query - Query parameters
   * @returns Array of appointments
   */
  list(query?: ListAppointmentsQuery): Promise<Appointment[]>

  /**
   * Count appointments matching a query.
   *
   * @param query - Query parameters
   * @returns Total count
   */
  count(query?: Omit<ListAppointmentsQuery, 'limit' | 'offset'>): Promise<number>

  /**
   * Update an appointment.
   *
   * @param id - The appointment ID
   * @param input - The fields to update
   * @returns The updated appointment
   */
  update(id: string, input: UpdateAppointmentInput): Promise<Appointment>

  /**
   * Update appointment status.
   *
   * @param id - The appointment ID
   * @param status - The new status
   * @returns The updated appointment
   */
  updateStatus(id: string, status: AppointmentStatus): Promise<Appointment>

  /**
   * Delete an appointment.
   *
   * @param id - The appointment ID
   */
  delete(id: string): Promise<void>

  /**
   * Count appointments for a patient.
   * Used to determine if patient should be marked as recurring.
   *
   * @param patientId - The patient ID
   * @returns Total appointment count for patient
   */
  countByPatient(patientId: string): Promise<number>

  /**
   * Find appointments needing priority escalation.
   * Returns CONFIRMED appointments older than X days.
   *
   * @param olderThanDays - Minimum age in days
   * @returns Array of appointments needing review
   */
  findNeedingEscalation(olderThanDays: number): Promise<Appointment[]>
}

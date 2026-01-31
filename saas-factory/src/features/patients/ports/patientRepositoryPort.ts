import type { Patient, CreatePatientInput, UpdatePatientInput, ListPatientsQuery } from '../types'

// ============================================
// Patient Repository Port
// ============================================

/**
 * Port for persisting and retrieving patients.
 *
 * This interface can be implemented by different adapters:
 * - Supabase adapter for production
 * - In-memory adapter for testing
 */
export interface PatientRepositoryPort {
  /**
   * Create a new patient.
   *
   * @param input - The patient data
   * @returns The created patient with generated ID and timestamps
   * @throws Error if email already exists
   */
  create(input: CreatePatientInput): Promise<Patient>

  /**
   * Find a patient by ID.
   *
   * @param id - The patient ID
   * @returns The patient or null if not found
   */
  findById(id: string): Promise<Patient | null>

  /**
   * Find a patient by email.
   *
   * @param email - The patient email
   * @returns The patient or null if not found
   */
  findByEmail(email: string): Promise<Patient | null>

  /**
   * Update a patient.
   *
   * @param id - The patient ID
   * @param input - The fields to update
   * @returns The updated patient
   * @throws Error if patient not found
   */
  update(id: string, input: UpdatePatientInput): Promise<Patient>

  /**
   * List patients with optional filtering.
   *
   * @param query - Query parameters
   * @returns Array of patients matching the query
   */
  list(query?: ListPatientsQuery): Promise<Patient[]>

  /**
   * Count patients matching a query.
   *
   * @param query - Query parameters (without limit/offset)
   * @returns Total count of matching patients
   */
  count(query?: Omit<ListPatientsQuery, 'limit' | 'offset'>): Promise<number>

  /**
   * Delete a patient.
   *
   * @param id - The patient ID
   * @throws Error if patient not found
   */
  delete(id: string): Promise<void>

  /**
   * Check if email is already in use.
   *
   * @param email - The email to check
   * @param excludeId - Optional patient ID to exclude (for updates)
   * @returns True if email is taken
   */
  emailExists(email: string, excludeId?: string): Promise<boolean>

  /**
   * Mark a patient as recurring.
   *
   * @param id - The patient ID
   * @returns The updated patient
   */
  markAsRecurring(id: string): Promise<Patient>
}

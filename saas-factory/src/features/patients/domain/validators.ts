import type { Patient, CreatePatientInput } from '../types'

// ============================================
// Patient Domain Validators
// ============================================

/**
 * Validation result type.
 */
export type ValidationResult =
  | { valid: true }
  | { valid: false; errors: string[] }

/**
 * Validates a phone number.
 * Business rule: Must have at least 8 digits.
 */
export function validatePhone(phone: string): ValidationResult {
  const digits = phone.replace(/\D/g, '')

  if (digits.length < 8) {
    return {
      valid: false,
      errors: [`Phone number must have at least 8 digits (found ${digits.length})`],
    }
  }

  return { valid: true }
}

/**
 * Validates a patient name.
 * Business rule: Must be at least 2 characters.
 */
export function validateName(name: string): ValidationResult {
  const trimmed = name.trim()

  if (trimmed.length < 2) {
    return {
      valid: false,
      errors: ['Name must be at least 2 characters'],
    }
  }

  if (trimmed.length > 100) {
    return {
      valid: false,
      errors: ['Name cannot exceed 100 characters'],
    }
  }

  return { valid: true }
}

/**
 * Validates a birth date.
 * Business rules:
 * - Cannot be in the future
 * - Cannot be more than 150 years ago
 */
export function validateBirthDate(birthDate: string): ValidationResult {
  const date = new Date(birthDate)
  const errors: string[] = []

  if (isNaN(date.getTime())) {
    return {
      valid: false,
      errors: ['Invalid date format'],
    }
  }

  const today = new Date()
  today.setHours(23, 59, 59, 999) // End of today

  if (date > today) {
    errors.push('Birth date cannot be in the future')
  }

  const maxAgeDate = new Date(today)
  maxAgeDate.setFullYear(maxAgeDate.getFullYear() - 150)

  if (date < maxAgeDate) {
    errors.push('Birth date cannot be more than 150 years ago')
  }

  if (errors.length > 0) {
    return { valid: false, errors }
  }

  return { valid: true }
}

/**
 * Validates an email address.
 */
export function validateEmail(email: string): ValidationResult {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailRegex.test(email)) {
    return {
      valid: false,
      errors: ['Invalid email format'],
    }
  }

  return { valid: true }
}

/**
 * Validates all patient fields for creation.
 * Returns all validation errors at once.
 */
export function validatePatientInput(input: CreatePatientInput): ValidationResult {
  const errors: string[] = []

  const nameResult = validateName(input.full_name)
  if (!nameResult.valid) errors.push(...nameResult.errors)

  const emailResult = validateEmail(input.email)
  if (!emailResult.valid) errors.push(...emailResult.errors)

  const phoneResult = validatePhone(input.phone)
  if (!phoneResult.valid) errors.push(...phoneResult.errors)

  const birthDateResult = validateBirthDate(input.birth_date)
  if (!birthDateResult.valid) errors.push(...birthDateResult.errors)

  if (errors.length > 0) {
    return { valid: false, errors }
  }

  return { valid: true }
}

// ============================================
// Business Logic Helpers
// ============================================

/**
 * Determines if a patient should be marked as recurring.
 * Business rule: Patients with 3+ previous appointments are recurring.
 */
export function shouldMarkAsRecurring(appointmentCount: number): boolean {
  return appointmentCount >= 3
}

/**
 * Calculates patient age from birth date.
 */
export function getPatientAge(birthDate: string): number {
  const birth = new Date(birthDate)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }

  return age
}

/**
 * Checks if a patient is a senior (65+).
 * Used for priority escalation in decision engine.
 */
export function isSeniorPatient(birthDate: string): boolean {
  return getPatientAge(birthDate) >= 65
}

/**
 * Checks if a patient is a minor (under 18).
 */
export function isMinorPatient(birthDate: string): boolean {
  return getPatientAge(birthDate) < 18
}

import { z } from 'zod'

// ============================================
// Validation Helpers
// ============================================

/**
 * Validates phone number format (minimum 8 digits).
 * Strips non-numeric characters before validation.
 */
const phoneSchema = z
  .string()
  .min(1, 'Phone number is required')
  .transform((val) => val.replace(/\D/g, '')) // Strip non-digits
  .refine((val) => val.length >= 8, {
    message: 'Phone number must have at least 8 digits',
  })

/**
 * Validates birth date:
 * - Cannot be in the future
 * - Cannot be more than 150 years ago
 */
const birthDateSchema = z
  .string()
  .refine(
    (val) => {
      const date = new Date(val)
      return !isNaN(date.getTime())
    },
    { message: 'Invalid date format' }
  )
  .refine(
    (val) => {
      const date = new Date(val)
      const today = new Date()
      return date <= today
    },
    { message: 'Birth date cannot be in the future' }
  )
  .refine(
    (val) => {
      const date = new Date(val)
      const today = new Date()
      const maxAge = new Date(today)
      maxAge.setFullYear(maxAge.getFullYear() - 150)
      return date >= maxAge
    },
    { message: 'Birth date cannot be more than 150 years ago' }
  )

// ============================================
// Patients - Zod Schemas
// ============================================

export const patientSchema = z.object({
  id: z.string().uuid(),
  full_name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters'),
  email: z.string().email('Invalid email format'),
  phone: phoneSchema,
  birth_date: birthDateSchema,
  is_recurring: z.boolean().default(false),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime().optional(),
})

export const createPatientSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters'),
  email: z.string().email('Invalid email format'),
  phone: phoneSchema,
  birth_date: birthDateSchema,
  is_recurring: z.boolean().default(false),
})

export const updatePatientSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters')
    .optional(),
  email: z.string().email('Invalid email format').optional(),
  phone: phoneSchema.optional(),
  birth_date: birthDateSchema.optional(),
  is_recurring: z.boolean().optional(),
})

// ============================================
// Query Schemas
// ============================================

export const listPatientsQuerySchema = z.object({
  search: z.string().optional(),
  is_recurring: z.boolean().optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
})

// ============================================
// Inferred Types
// ============================================

export type Patient = z.infer<typeof patientSchema>
export type CreatePatientInput = z.infer<typeof createPatientSchema>
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>
export type ListPatientsQuery = z.infer<typeof listPatientsQuerySchema>

// ============================================
// Utility Functions
// ============================================

/**
 * Calculates age from birth date.
 */
export function calculateAge(birthDate: string): number {
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
 * Formats phone number for display.
 */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }
  return phone
}

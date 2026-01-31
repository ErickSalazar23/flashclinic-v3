import { z } from 'zod'

// ============================================
// Auth Schemas
// ============================================

/**
 * Login credentials schema.
 */
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export type LoginInput = z.infer<typeof loginSchema>

/**
 * Signup credentials schema.
 */
export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export type SignupInput = z.infer<typeof signupSchema>

/**
 * User profile from Supabase auth.
 */
export const userProfileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  full_name: z.string().nullable(),
  avatar_url: z.string().url().nullable(),
  created_at: z.string().datetime(),
})

export type UserProfile = z.infer<typeof userProfileSchema>

/**
 * Session schema.
 */
export const sessionSchema = z.object({
  user: z.object({
    id: z.string().uuid(),
    email: z.string().email().nullable(),
    user_metadata: z.object({
      full_name: z.string().optional(),
    }).optional(),
  }),
  access_token: z.string(),
  expires_at: z.number().optional(),
})

export type Session = z.infer<typeof sessionSchema>

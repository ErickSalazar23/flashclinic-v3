import { z } from 'zod'

// ============================================
// Pending Decisions - Zod Schemas
// ============================================

export const decisionWeightEnum = z.enum(['LOW', 'MEDIUM', 'HIGH'])
export const referenceTypeEnum = z.enum(['APPOINTMENT'])

export const resolutionTypeEnum = z.enum(['APPROVED', 'REJECTED'])
export const autonomyLevelDbEnum = z.enum(['SUPERVISED', 'BLOCKED'])

export const pendingDecisionSchema = z.object({
  id: z.string().uuid(),
  reference_type: referenceTypeEnum,
  reference_id: z.string().uuid(),
  weight: decisionWeightEnum,
  reason: z.string().min(1, 'Reason is required'),
  autonomy_level: autonomyLevelDbEnum.nullable(),
  appointment_data: z.record(z.unknown()).nullable(),
  resolved_at: z.string().datetime().nullable(),
  resolved_by: z.string().uuid().nullable(),
  resolution_type: resolutionTypeEnum.nullable(),
  resolution_notes: z.string().nullable(),
  created_appointment_id: z.string().uuid().nullable(),
  created_at: z.string().datetime(),
})

export const createPendingDecisionSchema = z.object({
  reference_type: referenceTypeEnum,
  reference_id: z.string().uuid(),
  weight: decisionWeightEnum,
  reason: z.string().min(1, 'Reason is required'),
  autonomy_level: autonomyLevelDbEnum.nullable().optional(),
  appointment_data: z.record(z.unknown()).nullable().optional(),
})

export const resolvePendingDecisionSchema = z.object({
  resolved_by: z.string().uuid(),
})

// ============================================
// Decision Engine Types
// ============================================

export const autonomyLevelEnum = z.enum(['AUTOMATIC', 'SUPERVISED', 'BLOCKED'])

export const decisionContextSchema = z.object({
  type: z.string(),
  patientId: z.string().uuid().optional(),
  age: z.number().int().min(0).optional(),
  reason: z.string().optional(),
  waitTimeDays: z.number().int().min(0).optional(),
})

export const decisionResultSchema = z.object({
  autonomyLevel: autonomyLevelEnum,
  weight: decisionWeightEnum,
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  confidence: z.number().min(0).max(1),
  reason: z.string(),
})

// ============================================
// Inferred Types
// ============================================

export type DecisionWeight = z.infer<typeof decisionWeightEnum>
export type ReferenceType = z.infer<typeof referenceTypeEnum>
export type ResolutionType = z.infer<typeof resolutionTypeEnum>
export type PendingDecision = z.infer<typeof pendingDecisionSchema>
export type CreatePendingDecisionInput = z.infer<typeof createPendingDecisionSchema>
export type ResolvePendingDecisionInput = z.infer<typeof resolvePendingDecisionSchema>

export type AutonomyLevel = z.infer<typeof autonomyLevelEnum>
export type DecisionContext = z.infer<typeof decisionContextSchema>
export type DecisionResult = z.infer<typeof decisionResultSchema>

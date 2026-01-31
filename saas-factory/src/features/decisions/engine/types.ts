import type { Appointment, AppointmentStatus, AppointmentPriority } from '@/features/appointments/types'
import type { Patient } from '@/features/patients/types'
import type { AutonomyLevel, DecisionWeight, ReferenceType } from '../types'

// ============================================
// Evaluation Context - Input for Decision Engine
// ============================================

/**
 * Context provided to the decision engine for evaluation.
 * Contains all data needed to make a decision.
 */
export interface EvaluationContext {
  /** Type of entity being evaluated */
  referenceType: ReferenceType
  /** ID of the entity being evaluated */
  referenceId: string
  /** Current state of the appointment (if applicable) */
  appointment?: Appointment
  /** Previous state of the appointment (for transitions) */
  previousAppointment?: Appointment
  /** Patient data (if available) */
  patient?: Patient
  /** Additional metadata */
  metadata?: Record<string, unknown>
}

// ============================================
// Rule Evaluation Result
// ============================================

/**
 * Result from a single rule evaluation.
 * Returns null if the rule doesn't apply.
 */
export interface RuleEvaluationResult {
  /** Whether a decision is required */
  requiresDecision: true
  /** Suggested autonomy level */
  autonomyLevel: AutonomyLevel
  /** Weight/severity of the decision */
  weight: DecisionWeight
  /** Human-readable reason */
  reason: string
  /** Confidence score (0-1) */
  confidence: number
  /** Rule that triggered this result */
  ruleId: string
}

/**
 * A rule can return a result or null (if it doesn't apply)
 */
export type RuleResult = RuleEvaluationResult | null

// ============================================
// Decision Engine Output
// ============================================

/**
 * Final output from the decision engine after evaluating all rules.
 */
export interface DecisionEngineOutput {
  /** Whether any decision is required */
  requiresDecision: boolean
  /** Final autonomy level (most restrictive wins) */
  autonomyLevel: AutonomyLevel
  /** Final weight (highest wins) */
  weight: DecisionWeight
  /** Combined reasons from all triggering rules */
  reasons: string[]
  /** Individual rule results that triggered */
  triggeredRules: RuleEvaluationResult[]
  /** Overall confidence (lowest from triggered rules) */
  confidence: number
}

// ============================================
// Decision Creation Request
// ============================================

/**
 * Request to create a pending decision.
 */
export interface CreateDecisionRequest {
  referenceType: ReferenceType
  referenceId: string
  weight: DecisionWeight
  reason: string
}

// ============================================
// Decision Resolution Request
// ============================================

export type ResolutionType = 'APPROVED' | 'REJECTED'

/**
 * Request to resolve a pending decision.
 */
export interface ResolveDecisionRequest {
  decisionId: string
  resolvedBy: string
  resolution: ResolutionType
}

// ============================================
// Constants
// ============================================

/**
 * Priority ordering for autonomy levels (most restrictive first)
 */
export const AUTONOMY_PRIORITY: Record<AutonomyLevel, number> = {
  BLOCKED: 0,    // Highest priority (most restrictive)
  SUPERVISED: 1,
  AUTOMATIC: 2,  // Lowest priority (least restrictive)
}

/**
 * Priority ordering for decision weights
 */
export const WEIGHT_PRIORITY: Record<DecisionWeight, number> = {
  HIGH: 0,   // Highest priority
  MEDIUM: 1,
  LOW: 2,    // Lowest priority
}

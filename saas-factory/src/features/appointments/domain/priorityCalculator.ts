import type { AppointmentPriority } from '../types'

// ============================================
// Priority Calculator
// ============================================

/**
 * Input for priority calculation.
 */
export interface PriorityCalculationInput {
  /** Reason for the appointment */
  reason: string
  /** Patient age in years */
  patientAge: number
  /** Days until the appointment */
  waitTimeDays: number
}

/**
 * Result of priority calculation.
 */
export interface PriorityCalculationResult {
  priority: AppointmentPriority
  confidence: number
  reasons: string[]
}

/**
 * Urgency keywords that indicate high priority.
 */
const URGENCY_KEYWORDS = [
  'dolor fuerte',
  'sangrado',
  'pecho',
  'emergencia',
  'urgente',
  'severo',
  'intense pain',
  'bleeding',
  'chest',
  'emergency',
  'urgent',
  'severe',
]

/**
 * Calculates appointment priority based on business rules.
 *
 * Rules (from legacy FlashClinic):
 * 1. Urgency keywords in reason → HIGH
 * 2. Patient age ≥ 65 → MEDIUM (if not already HIGH)
 * 3. Wait time > 15 days → Escalate one level
 *
 * @param input - Calculation input
 * @returns Priority with confidence and reasons
 */
export function calculatePriority(
  input: PriorityCalculationInput
): PriorityCalculationResult {
  const { reason, patientAge, waitTimeDays } = input
  const reasonLower = reason.toLowerCase()
  const reasons: string[] = []

  let priority: AppointmentPriority = 'LOW'
  let confidence = 0.9

  // Rule 1: Urgency keywords → HIGH
  const hasUrgencyKeyword = URGENCY_KEYWORDS.some((keyword) =>
    reasonLower.includes(keyword)
  )

  if (hasUrgencyKeyword) {
    priority = 'HIGH'
    reasons.push('Urgency keywords detected in reason')
  }

  // Rule 2: Senior patient (65+) → MEDIUM minimum
  if (patientAge >= 65 && priority === 'LOW') {
    priority = 'MEDIUM'
    reasons.push('Patient is 65 or older')
  }

  // Rule 3: Long wait time → Escalate
  if (waitTimeDays > 15) {
    if (priority === 'LOW') {
      priority = 'MEDIUM'
      reasons.push(`Wait time of ${waitTimeDays} days exceeds 15 day threshold`)
    } else if (priority === 'MEDIUM') {
      priority = 'HIGH'
      reasons.push(`Wait time of ${waitTimeDays} days with MEDIUM priority escalates to HIGH`)
    }
  }

  // Lower confidence if no clear signals
  if (reasons.length === 0) {
    reasons.push('Standard priority - no escalation factors detected')
    confidence = 0.95
  }

  return {
    priority,
    confidence,
    reasons,
  }
}

/**
 * Detects if the input has ambiguous signals (contradictory indicators).
 *
 * Ambiguity cases:
 * - Urgency keywords but short wait time and young patient
 * - No urgency but long wait and senior patient
 * - Insufficient data (very short reason)
 */
export function detectAmbiguity(input: PriorityCalculationInput): {
  isAmbiguous: boolean
  reasons: string[]
} {
  const { reason, patientAge, waitTimeDays } = input
  const reasonLower = reason.toLowerCase()
  const reasons: string[] = []

  const hasUrgencyKeyword = URGENCY_KEYWORDS.some((keyword) =>
    reasonLower.includes(keyword)
  )

  // Contradictory: Urgent but short wait and young
  if (hasUrgencyKeyword && waitTimeDays <= 5 && patientAge < 50) {
    reasons.push('Urgency keywords present but short wait time and young patient')
  }

  // Contradictory: No urgency but long wait and senior
  if (!hasUrgencyKeyword && waitTimeDays > 20 && patientAge >= 70) {
    reasons.push('Long wait time for senior patient without urgency indicators')
  }

  // Insufficient data
  if (reason.length < 5) {
    reasons.push('Reason description is too short for proper evaluation')
  }

  if (patientAge <= 0 || patientAge > 150) {
    reasons.push('Invalid patient age')
  }

  if (waitTimeDays < 0) {
    reasons.push('Invalid wait time (appointment in the past)')
  }

  return {
    isAmbiguous: reasons.length > 0,
    reasons,
  }
}

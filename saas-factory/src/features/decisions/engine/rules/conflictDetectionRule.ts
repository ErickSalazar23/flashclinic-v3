import type { DecisionRule } from './types'
import type { EvaluationContext, RuleResult } from '../types'

// ============================================
// Conflict Detection Rule
// ============================================

/**
 * Rule that detects conflicting or ambiguous states.
 *
 * Business Logic:
 * - High priority + Cancelled status → conflict (why cancel high priority?)
 * - Recent creation + Completed status → suspicious (too fast)
 * - Contradictory metadata patterns
 */
export function createConflictDetectionRule(): DecisionRule {
  return {
    id: 'conflict-detection',
    name: 'Conflict Detection Rule',
    description: 'Detects conflicting or ambiguous states that require human judgment',

    evaluate(context: EvaluationContext): RuleResult {
      const { appointment, previousAppointment } = context

      if (!appointment || context.referenceType !== 'APPOINTMENT') {
        return null
      }

      // Conflict 1: High priority appointment being cancelled
      if (
        previousAppointment &&
        previousAppointment.priority === 'HIGH' &&
        appointment.status === 'CANCELLED'
      ) {
        return {
          requiresDecision: true,
          autonomyLevel: 'BLOCKED',
          weight: 'HIGH',
          reason: 'High priority appointment is being cancelled. Please confirm this is intentional and document the reason.',
          confidence: 0.95,
          ruleId: 'conflict-detection',
        }
      }

      // Conflict 2: Very quick attendance marking (less than 1 minute)
      if (appointment.status === 'ATTENDED') {
        const createdAt = new Date(appointment.created_at)
        const now = new Date()
        const minutesSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60)

        if (minutesSinceCreation < 1) {
          return {
            requiresDecision: true,
            autonomyLevel: 'SUPERVISED',
            weight: 'MEDIUM',
            reason: `Appointment marked as attended very quickly (${Math.round(minutesSinceCreation * 60)} seconds after creation). Please verify this is correct.`,
            confidence: 0.75,
            ruleId: 'conflict-detection',
          }
        }
      }

      // Conflict 3: Priority downgrade
      if (previousAppointment) {
        const priorityOrder = { HIGH: 2, MEDIUM: 1, LOW: 0 }
        const prevPriority = priorityOrder[previousAppointment.priority]
        const currPriority = priorityOrder[appointment.priority]

        if (currPriority < prevPriority) {
          return {
            requiresDecision: true,
            autonomyLevel: 'SUPERVISED',
            weight: 'MEDIUM',
            reason: `Priority is being downgraded from ${previousAppointment.priority} to ${appointment.priority}. Please confirm this change.`,
            confidence: 0.85,
            ruleId: 'conflict-detection',
          }
        }
      }

      return null
    },
  }
}

/**
 * Default instance of the conflict detection rule.
 */
export const conflictDetectionRule = createConflictDetectionRule()

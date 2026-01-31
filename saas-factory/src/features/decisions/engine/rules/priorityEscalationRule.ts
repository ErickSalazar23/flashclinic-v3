import type { DecisionRule } from './types'
import type { EvaluationContext, RuleResult } from '../types'

// ============================================
// Priority Escalation Rule
// ============================================

/**
 * Configuration for priority escalation thresholds.
 */
interface PriorityEscalationConfig {
  /** Days since creation to trigger medium priority escalation */
  mediumThresholdDays: number
  /** Days since creation to trigger high priority escalation */
  highThresholdDays: number
}

const DEFAULT_CONFIG: PriorityEscalationConfig = {
  mediumThresholdDays: 7,
  highThresholdDays: 14,
}

/**
 * Rule that detects when an appointment's priority should be escalated
 * based on how long it has been pending.
 *
 * Business Logic:
 * - LOW priority appointments pending > 7 days → suggest MEDIUM (SUPERVISED)
 * - MEDIUM priority appointments pending > 14 days → suggest HIGH (BLOCKED)
 */
export function createPriorityEscalationRule(
  config: PriorityEscalationConfig = DEFAULT_CONFIG
): DecisionRule {
  return {
    id: 'priority-escalation',
    name: 'Priority Escalation Rule',
    description: 'Detects appointments that may need priority escalation based on age',

    evaluate(context: EvaluationContext): RuleResult {
      const { appointment } = context

      // Rule only applies to appointments
      if (!appointment || context.referenceType !== 'APPOINTMENT') {
        return null
      }

      // Only evaluate confirmed appointments (not completed/cancelled)
      if (appointment.status !== 'CONFIRMED') {
        return null
      }

      const createdAt = new Date(appointment.created_at)
      const now = new Date()
      const daysPending = Math.floor(
        (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
      )

      // HIGH priority appointments don't need escalation
      if (appointment.priority === 'HIGH') {
        return null
      }

      // MEDIUM → HIGH escalation check
      if (appointment.priority === 'MEDIUM' && daysPending >= config.highThresholdDays) {
        return {
          requiresDecision: true,
          autonomyLevel: 'BLOCKED',
          weight: 'HIGH',
          reason: `Appointment has been pending for ${daysPending} days at MEDIUM priority. Consider escalating to HIGH priority.`,
          confidence: 0.85,
          ruleId: 'priority-escalation',
        }
      }

      // LOW → MEDIUM escalation check
      if (appointment.priority === 'LOW' && daysPending >= config.mediumThresholdDays) {
        return {
          requiresDecision: true,
          autonomyLevel: 'SUPERVISED',
          weight: 'MEDIUM',
          reason: `Appointment has been pending for ${daysPending} days at LOW priority. Consider escalating to MEDIUM priority.`,
          confidence: 0.8,
          ruleId: 'priority-escalation',
        }
      }

      return null
    },
  }
}

/**
 * Default instance of the priority escalation rule.
 */
export const priorityEscalationRule = createPriorityEscalationRule()

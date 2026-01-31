import type { DecisionRule } from './types'
import type { EvaluationContext, RuleResult } from '../types'
import { VALID_STATUS_TRANSITIONS } from '@/features/appointments/types'

// ============================================
// Status Transition Rule
// ============================================

/**
 * Rule that validates appointment status transitions.
 *
 * Business Logic:
 * - Valid transitions proceed automatically (AUTOMATIC)
 * - Invalid transitions require human review (BLOCKED)
 * - Transitions to terminal states (ATTENDED, NO_SHOW, CANCELLED) need confirmation (SUPERVISED)
 */
export function createStatusTransitionRule(): DecisionRule {
  return {
    id: 'status-transition',
    name: 'Status Transition Rule',
    description: 'Validates appointment status transitions against the state machine',

    evaluate(context: EvaluationContext): RuleResult {
      const { appointment, previousAppointment } = context

      // Rule only applies when there's a status change
      if (!appointment || !previousAppointment) {
        return null
      }

      if (context.referenceType !== 'APPOINTMENT') {
        return null
      }

      const fromStatus = previousAppointment.status
      const toStatus = appointment.status

      // No change, rule doesn't apply
      if (fromStatus === toStatus) {
        return null
      }

      const validTransitions = VALID_STATUS_TRANSITIONS[fromStatus] || []
      const isValidTransition = validTransitions.includes(toStatus)

      // Invalid transition - BLOCKED
      if (!isValidTransition) {
        return {
          requiresDecision: true,
          autonomyLevel: 'BLOCKED',
          weight: 'HIGH',
          reason: `Invalid status transition from ${fromStatus} to ${toStatus}. Valid transitions are: ${validTransitions.join(', ') || 'none (terminal state)'}.`,
          confidence: 1.0, // Deterministic rule
          ruleId: 'status-transition',
        }
      }

      // Transition to terminal state - requires confirmation
      const terminalStates = ['ATTENDED', 'NO_SHOW', 'CANCELLED']
      const isTerminalTransition = terminalStates.includes(toStatus)
      if (isTerminalTransition) {
        return {
          requiresDecision: true,
          autonomyLevel: 'SUPERVISED',
          weight: 'MEDIUM',
          reason: `Appointment is transitioning to terminal state: ${toStatus}. Please confirm this action.`,
          confidence: 0.95,
          ruleId: 'status-transition',
        }
      }

      // Valid non-terminal transition - automatic
      return null
    },
  }
}

/**
 * Default instance of the status transition rule.
 */
export const statusTransitionRule = createStatusTransitionRule()

import type { DecisionRule } from './types'
import type { EvaluationContext, RuleResult } from '../types'

// ============================================
// Missing Data Rule
// ============================================

/**
 * Configuration for required fields.
 */
interface MissingDataConfig {
  /** Whether patient data is required for evaluation */
  requirePatient: boolean
}

const DEFAULT_CONFIG: MissingDataConfig = {
  requirePatient: true,
}

/**
 * Rule that detects when required data is missing for proper evaluation.
 *
 * Business Logic:
 * - Missing appointment data → BLOCKED (cannot proceed)
 * - Missing patient data → SUPERVISED (may need lookup)
 * - Missing reference ID → BLOCKED (critical error)
 */
export function createMissingDataRule(
  config: MissingDataConfig = DEFAULT_CONFIG
): DecisionRule {
  return {
    id: 'missing-data',
    name: 'Missing Data Rule',
    description: 'Detects when required data is missing for proper evaluation',

    evaluate(context: EvaluationContext): RuleResult {
      const { referenceType, referenceId, appointment, patient } = context
      const missingFields: string[] = []

      // Critical: Missing reference ID
      if (!referenceId) {
        return {
          requiresDecision: true,
          autonomyLevel: 'BLOCKED',
          weight: 'HIGH',
          reason: 'Missing reference ID. Cannot process decision without entity identifier.',
          confidence: 1.0,
          ruleId: 'missing-data',
        }
      }

      // For appointments, check required fields
      if (referenceType === 'APPOINTMENT') {
        if (!appointment) {
          return {
            requiresDecision: true,
            autonomyLevel: 'BLOCKED',
            weight: 'HIGH',
            reason: 'Appointment data is missing. Cannot evaluate without appointment details.',
            confidence: 1.0,
            ruleId: 'missing-data',
          }
        }

        // Check appointment required fields
        if (!appointment.patient_id) {
          missingFields.push('patient_id')
        }
        if (!appointment.status) {
          missingFields.push('status')
        }
        if (!appointment.priority) {
          missingFields.push('priority')
        }

        // Patient data check (configurable)
        if (config.requirePatient && !patient) {
          return {
            requiresDecision: true,
            autonomyLevel: 'SUPERVISED',
            weight: 'MEDIUM',
            reason: 'Patient data is not available. Manual review may be needed to verify patient information.',
            confidence: 0.9,
            ruleId: 'missing-data',
          }
        }
      }

      // Report missing fields
      if (missingFields.length > 0) {
        return {
          requiresDecision: true,
          autonomyLevel: 'BLOCKED',
          weight: 'HIGH',
          reason: `Missing required fields: ${missingFields.join(', ')}. Cannot proceed with incomplete data.`,
          confidence: 1.0,
          ruleId: 'missing-data',
        }
      }

      return null
    },
  }
}

/**
 * Default instance of the missing data rule.
 */
export const missingDataRule = createMissingDataRule()

import type { DecisionRule } from './rules/types'
import type {
  EvaluationContext,
  RuleEvaluationResult,
  DecisionEngineOutput,
} from './types'
import { AUTONOMY_PRIORITY, WEIGHT_PRIORITY } from './types'
import type { AutonomyLevel, DecisionWeight } from '../types'

// ============================================
// Pure Evaluation Functions
// ============================================

/**
 * Evaluates a single rule against a context.
 * Pure function - no side effects.
 *
 * @param rule - The decision rule to evaluate
 * @param context - The evaluation context
 * @returns The rule result or null if rule doesn't apply
 */
export function evaluateRule(
  rule: DecisionRule,
  context: EvaluationContext
): RuleEvaluationResult | null {
  try {
    return rule.evaluate(context)
  } catch (error) {
    // Rule errors should not break the evaluation
    // Log error in production, return a blocked decision for safety
    console.error(`Rule ${rule.id} threw an error:`, error)
    return {
      requiresDecision: true,
      autonomyLevel: 'BLOCKED',
      weight: 'HIGH',
      reason: `Rule "${rule.name}" encountered an error during evaluation. Manual review required.`,
      confidence: 0.5,
      ruleId: rule.id,
    }
  }
}

/**
 * Evaluates all rules against a context and aggregates results.
 * Pure function - no side effects.
 *
 * Aggregation Strategy:
 * - Most restrictive autonomy level wins (BLOCKED > SUPERVISED > AUTOMATIC)
 * - Highest weight wins (HIGH > MEDIUM > LOW)
 * - Lowest confidence from triggered rules
 * - All reasons are collected
 *
 * @param rules - Array of decision rules to evaluate
 * @param context - The evaluation context
 * @returns Aggregated decision engine output
 */
export function evaluateAllRules(
  rules: DecisionRule[],
  context: EvaluationContext
): DecisionEngineOutput {
  const triggeredRules: RuleEvaluationResult[] = []

  // Evaluate each rule
  for (const rule of rules) {
    const result = evaluateRule(rule, context)
    if (result !== null) {
      triggeredRules.push(result)
    }
  }

  // No rules triggered - automatic processing
  if (triggeredRules.length === 0) {
    return {
      requiresDecision: false,
      autonomyLevel: 'AUTOMATIC',
      weight: 'LOW',
      reasons: [],
      triggeredRules: [],
      confidence: 1.0,
    }
  }

  // Aggregate results
  const finalAutonomyLevel = getMostRestrictiveAutonomy(
    triggeredRules.map((r) => r.autonomyLevel)
  )
  const finalWeight = getHighestWeight(
    triggeredRules.map((r) => r.weight)
  )
  const lowestConfidence = Math.min(...triggeredRules.map((r) => r.confidence))
  const reasons = triggeredRules.map((r) => r.reason)

  return {
    requiresDecision: true,
    autonomyLevel: finalAutonomyLevel,
    weight: finalWeight,
    reasons,
    triggeredRules,
    confidence: lowestConfidence,
  }
}

// ============================================
// Helper Functions
// ============================================

/**
 * Returns the most restrictive autonomy level from a list.
 * BLOCKED > SUPERVISED > AUTOMATIC
 */
export function getMostRestrictiveAutonomy(levels: AutonomyLevel[]): AutonomyLevel {
  if (levels.length === 0) {
    return 'AUTOMATIC'
  }

  return levels.reduce((most, current) => {
    const mostPriority = AUTONOMY_PRIORITY[most]
    const currentPriority = AUTONOMY_PRIORITY[current]
    return currentPriority < mostPriority ? current : most
  })
}

/**
 * Returns the highest weight from a list.
 * HIGH > MEDIUM > LOW
 */
export function getHighestWeight(weights: DecisionWeight[]): DecisionWeight {
  if (weights.length === 0) {
    return 'LOW'
  }

  return weights.reduce((highest, current) => {
    const highestPriority = WEIGHT_PRIORITY[highest]
    const currentPriority = WEIGHT_PRIORITY[current]
    return currentPriority < highestPriority ? current : highest
  })
}

/**
 * Checks if a decision requires human intervention.
 */
export function requiresHumanIntervention(output: DecisionEngineOutput): boolean {
  return output.requiresDecision && output.autonomyLevel !== 'AUTOMATIC'
}

/**
 * Formats the decision output as a human-readable summary.
 */
export function formatDecisionSummary(output: DecisionEngineOutput): string {
  if (!output.requiresDecision) {
    return 'No decision required. Automatic processing allowed.'
  }

  const lines = [
    `Decision Required: ${output.autonomyLevel}`,
    `Weight: ${output.weight}`,
    `Confidence: ${(output.confidence * 100).toFixed(0)}%`,
    `Triggered Rules: ${output.triggeredRules.length}`,
    '',
    'Reasons:',
    ...output.reasons.map((r, i) => `  ${i + 1}. ${r}`),
  ]

  return lines.join('\n')
}

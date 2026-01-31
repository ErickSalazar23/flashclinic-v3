import type { DecisionRule, RuleRegistry } from './rules/types'
import type { EvaluationContext, DecisionEngineOutput } from './types'
import { evaluateAllRules, requiresHumanIntervention } from './evaluator'
import { DEFAULT_RULES, createRuleRegistry } from './rules'

// ============================================
// Decision Engine
// ============================================

/**
 * Configuration for the Decision Engine.
 */
export interface DecisionEngineConfig {
  /** Custom rules to use instead of defaults */
  rules?: DecisionRule[]
  /** Whether to use a mutable registry (allows runtime rule changes) */
  useMutableRegistry?: boolean
}

/**
 * The Decision Engine evaluates business conditions and determines
 * when human intervention is required.
 *
 * Features:
 * - Pluggable rule system
 * - Deterministic evaluation
 * - Aggregated results with confidence scores
 * - Extensible via rule registry
 *
 * @example
 * ```typescript
 * const engine = createDecisionEngine()
 *
 * const output = engine.evaluate({
 *   referenceType: 'APPOINTMENT',
 *   referenceId: '123',
 *   appointment: { ... },
 *   patient: { ... },
 * })
 *
 * if (engine.requiresHumanDecision(output)) {
 *   // Create pending decision
 * }
 * ```
 */
export interface DecisionEngine {
  /**
   * Evaluate a context against all registered rules.
   */
  evaluate(context: EvaluationContext): DecisionEngineOutput

  /**
   * Check if the output requires human intervention.
   */
  requiresHumanDecision(output: DecisionEngineOutput): boolean

  /**
   * Get the rule registry (if mutable registry is enabled).
   */
  getRegistry(): RuleRegistry | null

  /**
   * Get all currently registered rules.
   */
  getRules(): DecisionRule[]
}

/**
 * Creates a new Decision Engine instance.
 *
 * @param config - Optional configuration
 * @returns A new DecisionEngine instance
 */
export function createDecisionEngine(config: DecisionEngineConfig = {}): DecisionEngine {
  const { rules = DEFAULT_RULES, useMutableRegistry = false } = config

  // Create registry if mutable, otherwise use static array
  const registry = useMutableRegistry ? createRuleRegistry(rules) : null
  const staticRules = useMutableRegistry ? null : [...rules]

  return {
    evaluate(context: EvaluationContext): DecisionEngineOutput {
      const currentRules = registry ? registry.getRules() : staticRules!
      return evaluateAllRules(currentRules, context)
    },

    requiresHumanDecision(output: DecisionEngineOutput): boolean {
      return requiresHumanIntervention(output)
    },

    getRegistry(): RuleRegistry | null {
      return registry
    },

    getRules(): DecisionRule[] {
      return registry ? registry.getRules() : [...staticRules!]
    },
  }
}

// ============================================
// Singleton Instance
// ============================================

/**
 * Default Decision Engine instance with standard rules.
 * Use this for most cases.
 */
export const decisionEngine = createDecisionEngine()

// ============================================
// Convenience Functions
// ============================================

/**
 * Evaluates a context using the default decision engine.
 * Convenience function for simple use cases.
 *
 * @param context - The evaluation context
 * @returns The decision engine output
 */
export function evaluate(context: EvaluationContext): DecisionEngineOutput {
  return decisionEngine.evaluate(context)
}

/**
 * Quick check if a context requires human decision.
 *
 * @param context - The evaluation context
 * @returns True if human intervention is required
 */
export function needsHumanDecision(context: EvaluationContext): boolean {
  const output = decisionEngine.evaluate(context)
  return decisionEngine.requiresHumanDecision(output)
}

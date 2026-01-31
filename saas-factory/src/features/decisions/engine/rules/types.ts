import type { EvaluationContext, RuleResult } from '../types'

// ============================================
// Decision Rule Interface
// ============================================

/**
 * A decision rule evaluates a context and determines if a decision is needed.
 *
 * Rules are:
 * - Pure functions (no side effects)
 * - Deterministic (same input = same output)
 * - Composable (multiple rules can be combined)
 * - Testable in isolation
 */
export interface DecisionRule {
  /** Unique identifier for this rule */
  readonly id: string

  /** Human-readable name */
  readonly name: string

  /** Description of what this rule checks */
  readonly description: string

  /**
   * Evaluate the context and return a result if decision is needed.
   * Returns null if this rule doesn't apply to the given context.
   */
  evaluate(context: EvaluationContext): RuleResult
}

// ============================================
// Rule Factory Type
// ============================================

/**
 * Factory function for creating rules with configuration.
 */
export type RuleFactory<TConfig = void> = TConfig extends void
  ? () => DecisionRule
  : (config: TConfig) => DecisionRule

// ============================================
// Rule Registry
// ============================================

/**
 * Registry for managing decision rules.
 */
export interface RuleRegistry {
  /** Get all registered rules */
  getRules(): DecisionRule[]

  /** Register a new rule */
  register(rule: DecisionRule): void

  /** Unregister a rule by ID */
  unregister(ruleId: string): void

  /** Get a specific rule by ID */
  getRule(ruleId: string): DecisionRule | undefined
}

// Decision Rules - Exports
export * from './types'
export * from './priorityEscalationRule'
export * from './statusTransitionRule'
export * from './missingDataRule'
export * from './conflictDetectionRule'

import type { DecisionRule, RuleRegistry } from './types'
import { priorityEscalationRule } from './priorityEscalationRule'
import { statusTransitionRule } from './statusTransitionRule'
import { missingDataRule } from './missingDataRule'
import { conflictDetectionRule } from './conflictDetectionRule'

// ============================================
// Default Rule Set
// ============================================

/**
 * Default set of decision rules in evaluation order.
 * Order matters: more critical rules should come first.
 */
export const DEFAULT_RULES: DecisionRule[] = [
  missingDataRule,        // Check data integrity first
  statusTransitionRule,   // Validate state machine
  conflictDetectionRule,  // Detect conflicts
  priorityEscalationRule, // Check for needed escalations
]

// ============================================
// Rule Registry Implementation
// ============================================

/**
 * Creates a mutable rule registry for managing decision rules.
 */
export function createRuleRegistry(initialRules: DecisionRule[] = DEFAULT_RULES): RuleRegistry {
  const rules = new Map<string, DecisionRule>()

  // Initialize with provided rules
  initialRules.forEach((rule) => rules.set(rule.id, rule))

  return {
    getRules(): DecisionRule[] {
      return Array.from(rules.values())
    },

    register(rule: DecisionRule): void {
      rules.set(rule.id, rule)
    },

    unregister(ruleId: string): void {
      rules.delete(ruleId)
    },

    getRule(ruleId: string): DecisionRule | undefined {
      return rules.get(ruleId)
    },
  }
}

/**
 * Default rule registry instance.
 */
export const defaultRuleRegistry = createRuleRegistry()

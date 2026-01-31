import { describe, it, expect } from 'vitest'
import {
  evaluateRule,
  evaluateAllRules,
  getMostRestrictiveAutonomy,
  getHighestWeight,
  requiresHumanIntervention,
} from './evaluator'
import type { DecisionRule } from './rules/types'
import type { EvaluationContext, RuleEvaluationResult } from './types'

// Mock rules for testing
const mockAutomaticRule: DecisionRule = {
  id: 'auto-rule',
  name: 'Automatic Rule',
  description: 'Always returns null (automatic)',
  evaluate: () => null,
}

const mockSupervisedRule: DecisionRule = {
  id: 'supervised-rule',
  name: 'Supervised Rule',
  description: 'Always returns SUPERVISED',
  evaluate: (): RuleEvaluationResult => ({
    requiresDecision: true,
    autonomyLevel: 'SUPERVISED',
    weight: 'MEDIUM',
    reason: 'Requires supervision',
    confidence: 0.8,
    ruleId: 'supervised-rule',
  }),
}

const mockBlockedRule: DecisionRule = {
  id: 'blocked-rule',
  name: 'Blocked Rule',
  description: 'Always returns BLOCKED',
  evaluate: (): RuleEvaluationResult => ({
    requiresDecision: true,
    autonomyLevel: 'BLOCKED',
    weight: 'HIGH',
    reason: 'Blocked for review',
    confidence: 0.9,
    ruleId: 'blocked-rule',
  }),
}

const mockThrowingRule: DecisionRule = {
  id: 'throwing-rule',
  name: 'Throwing Rule',
  description: 'Throws an error',
  evaluate: () => {
    throw new Error('Rule error')
  },
}

const mockContext: EvaluationContext = {
  referenceType: 'APPOINTMENT',
  referenceId: 'test-id',
}

describe('evaluateRule', () => {
  it('should return null when rule returns null', () => {
    const result = evaluateRule(mockAutomaticRule, mockContext)
    expect(result).toBeNull()
  })

  it('should return the rule result when rule triggers', () => {
    const result = evaluateRule(mockSupervisedRule, mockContext)
    expect(result).not.toBeNull()
    expect(result?.autonomyLevel).toBe('SUPERVISED')
  })

  it('should handle throwing rules gracefully', () => {
    const result = evaluateRule(mockThrowingRule, mockContext)
    expect(result).not.toBeNull()
    expect(result?.autonomyLevel).toBe('BLOCKED')
    expect(result?.reason).toContain('error')
  })
})

describe('evaluateAllRules', () => {
  it('should return AUTOMATIC when no rules trigger', () => {
    const result = evaluateAllRules([mockAutomaticRule], mockContext)

    expect(result.requiresDecision).toBe(false)
    expect(result.autonomyLevel).toBe('AUTOMATIC')
    expect(result.triggeredRules).toHaveLength(0)
    expect(result.confidence).toBe(1.0)
  })

  it('should aggregate results from multiple triggered rules', () => {
    const result = evaluateAllRules(
      [mockAutomaticRule, mockSupervisedRule, mockBlockedRule],
      mockContext
    )

    expect(result.requiresDecision).toBe(true)
    expect(result.triggeredRules).toHaveLength(2)
    expect(result.reasons).toContain('Requires supervision')
    expect(result.reasons).toContain('Blocked for review')
  })

  it('should use most restrictive autonomy level', () => {
    const result = evaluateAllRules(
      [mockSupervisedRule, mockBlockedRule],
      mockContext
    )

    expect(result.autonomyLevel).toBe('BLOCKED') // Most restrictive
  })

  it('should use highest weight', () => {
    const result = evaluateAllRules(
      [mockSupervisedRule, mockBlockedRule],
      mockContext
    )

    expect(result.weight).toBe('HIGH') // Highest weight
  })

  it('should use lowest confidence', () => {
    const result = evaluateAllRules(
      [mockSupervisedRule, mockBlockedRule],
      mockContext
    )

    expect(result.confidence).toBe(0.8) // Lower of 0.8 and 0.9
  })
})

describe('getMostRestrictiveAutonomy', () => {
  it('should return AUTOMATIC for empty array', () => {
    expect(getMostRestrictiveAutonomy([])).toBe('AUTOMATIC')
  })

  it('should return BLOCKED when present', () => {
    expect(getMostRestrictiveAutonomy(['AUTOMATIC', 'SUPERVISED', 'BLOCKED']))
      .toBe('BLOCKED')
  })

  it('should return SUPERVISED when no BLOCKED', () => {
    expect(getMostRestrictiveAutonomy(['AUTOMATIC', 'SUPERVISED']))
      .toBe('SUPERVISED')
  })

  it('should return AUTOMATIC when only AUTOMATIC', () => {
    expect(getMostRestrictiveAutonomy(['AUTOMATIC', 'AUTOMATIC']))
      .toBe('AUTOMATIC')
  })
})

describe('getHighestWeight', () => {
  it('should return LOW for empty array', () => {
    expect(getHighestWeight([])).toBe('LOW')
  })

  it('should return HIGH when present', () => {
    expect(getHighestWeight(['LOW', 'MEDIUM', 'HIGH'])).toBe('HIGH')
  })

  it('should return MEDIUM when no HIGH', () => {
    expect(getHighestWeight(['LOW', 'MEDIUM'])).toBe('MEDIUM')
  })

  it('should return LOW when only LOW', () => {
    expect(getHighestWeight(['LOW', 'LOW'])).toBe('LOW')
  })
})

describe('requiresHumanIntervention', () => {
  it('should return false when no decision required', () => {
    const output = {
      requiresDecision: false,
      autonomyLevel: 'AUTOMATIC' as const,
      weight: 'LOW' as const,
      reasons: [],
      triggeredRules: [],
      confidence: 1.0,
    }

    expect(requiresHumanIntervention(output)).toBe(false)
  })

  it('should return false when AUTOMATIC', () => {
    const output = {
      requiresDecision: true,
      autonomyLevel: 'AUTOMATIC' as const,
      weight: 'LOW' as const,
      reasons: ['test'],
      triggeredRules: [],
      confidence: 1.0,
    }

    expect(requiresHumanIntervention(output)).toBe(false)
  })

  it('should return true when SUPERVISED', () => {
    const output = {
      requiresDecision: true,
      autonomyLevel: 'SUPERVISED' as const,
      weight: 'MEDIUM' as const,
      reasons: ['test'],
      triggeredRules: [],
      confidence: 0.8,
    }

    expect(requiresHumanIntervention(output)).toBe(true)
  })

  it('should return true when BLOCKED', () => {
    const output = {
      requiresDecision: true,
      autonomyLevel: 'BLOCKED' as const,
      weight: 'HIGH' as const,
      reasons: ['test'],
      triggeredRules: [],
      confidence: 0.5,
    }

    expect(requiresHumanIntervention(output)).toBe(true)
  })
})

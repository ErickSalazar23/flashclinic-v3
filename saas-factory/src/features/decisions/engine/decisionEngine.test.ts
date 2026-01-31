import { describe, it, expect } from 'vitest'
import { createDecisionEngine, decisionEngine, evaluate, needsHumanDecision } from './decisionEngine'
import type { DecisionRule } from './rules/types'
import type { EvaluationContext, RuleEvaluationResult } from './types'

// Mock rules
const alwaysBlockedRule: DecisionRule = {
  id: 'always-blocked',
  name: 'Always Blocked',
  description: 'Test rule that always blocks',
  evaluate: (): RuleEvaluationResult => ({
    requiresDecision: true,
    autonomyLevel: 'BLOCKED',
    weight: 'HIGH',
    reason: 'Always blocked for testing',
    confidence: 1.0,
    ruleId: 'always-blocked',
  }),
}

const neverTriggersRule: DecisionRule = {
  id: 'never-triggers',
  name: 'Never Triggers',
  description: 'Test rule that never triggers',
  evaluate: () => null,
}

describe('createDecisionEngine', () => {
  it('should create an engine with default rules', () => {
    const engine = createDecisionEngine()
    const rules = engine.getRules()

    expect(rules.length).toBeGreaterThan(0)
    expect(rules.some(r => r.id === 'missing-data')).toBe(true)
    expect(rules.some(r => r.id === 'status-transition')).toBe(true)
    expect(rules.some(r => r.id === 'priority-escalation')).toBe(true)
  })

  it('should create an engine with custom rules', () => {
    const engine = createDecisionEngine({
      rules: [alwaysBlockedRule, neverTriggersRule],
    })
    const rules = engine.getRules()

    expect(rules).toHaveLength(2)
    expect(rules.some(r => r.id === 'always-blocked')).toBe(true)
    expect(rules.some(r => r.id === 'never-triggers')).toBe(true)
  })

  it('should support mutable registry', () => {
    const engine = createDecisionEngine({
      rules: [neverTriggersRule],
      useMutableRegistry: true,
    })

    expect(engine.getRegistry()).not.toBeNull()

    // Add rule dynamically
    engine.getRegistry()?.register(alwaysBlockedRule)
    expect(engine.getRules()).toHaveLength(2)

    // Remove rule
    engine.getRegistry()?.unregister('always-blocked')
    expect(engine.getRules()).toHaveLength(1)
  })

  it('should return null registry when not mutable', () => {
    const engine = createDecisionEngine({ useMutableRegistry: false })
    expect(engine.getRegistry()).toBeNull()
  })
})

describe('engine.evaluate', () => {
  it('should return requiresDecision: false when no rules trigger', () => {
    const engine = createDecisionEngine({ rules: [neverTriggersRule] })

    const context: EvaluationContext = {
      referenceType: 'APPOINTMENT',
      referenceId: 'test-id',
      appointment: {
        id: 'test-id',
        patient_id: 'patient-id',
        status: 'CONFIRMED',
        priority: 'LOW',
        scheduled_at: new Date(Date.now() + 86400000).toISOString(),
        reason: 'Test reason',
        specialty: 'General Medicine',
        created_at: new Date().toISOString(),
      },
    }

    const result = engine.evaluate(context)

    expect(result.requiresDecision).toBe(false)
    expect(result.autonomyLevel).toBe('AUTOMATIC')
  })

  it('should return requiresDecision: true when rules trigger', () => {
    const engine = createDecisionEngine({ rules: [alwaysBlockedRule] })

    const context: EvaluationContext = {
      referenceType: 'APPOINTMENT',
      referenceId: 'test-id',
    }

    const result = engine.evaluate(context)

    expect(result.requiresDecision).toBe(true)
    expect(result.autonomyLevel).toBe('BLOCKED')
    expect(result.weight).toBe('HIGH')
  })
})

describe('engine.requiresHumanDecision', () => {
  const engine = createDecisionEngine({ rules: [alwaysBlockedRule] })

  it('should return true for BLOCKED decisions', () => {
    const output = engine.evaluate({
      referenceType: 'APPOINTMENT',
      referenceId: 'test-id',
    })

    expect(engine.requiresHumanDecision(output)).toBe(true)
  })

  it('should return false for AUTOMATIC decisions', () => {
    const automaticEngine = createDecisionEngine({ rules: [neverTriggersRule] })
    const output = automaticEngine.evaluate({
      referenceType: 'APPOINTMENT',
      referenceId: 'test-id',
    })

    expect(automaticEngine.requiresHumanDecision(output)).toBe(false)
  })
})

describe('convenience functions', () => {
  describe('evaluate', () => {
    it('should use the default engine', () => {
      const result = evaluate({
        referenceType: 'APPOINTMENT',
        referenceId: 'test-id',
        appointment: {
          id: 'test-id',
          patient_id: 'patient-id',
          status: 'CONFIRMED',
          priority: 'LOW',
          scheduled_at: new Date(Date.now() + 86400000).toISOString(),
          reason: 'Test reason',
          specialty: 'General Medicine',
          created_at: new Date().toISOString(),
        },
        patient: {
          id: 'patient-id',
          full_name: 'Test Patient',
          email: 'test@example.com',
          phone: '1234567890',
          birth_date: '1990-01-01',
          is_recurring: false,
          created_at: new Date().toISOString(),
        },
      })

      expect(result).toBeDefined()
      expect(result.autonomyLevel).toBeDefined()
    })
  })

  describe('needsHumanDecision', () => {
    it('should return boolean result', () => {
      const result = needsHumanDecision({
        referenceType: 'APPOINTMENT',
        referenceId: 'test-id',
        appointment: {
          id: 'test-id',
          patient_id: 'patient-id',
          status: 'CONFIRMED',
          priority: 'LOW',
          scheduled_at: new Date(Date.now() + 86400000).toISOString(),
          reason: 'Test reason',
          specialty: 'General Medicine',
          created_at: new Date().toISOString(),
        },
        patient: {
          id: 'patient-id',
          full_name: 'Test Patient',
          email: 'test@example.com',
          phone: '1234567890',
          birth_date: '1990-01-01',
          is_recurring: false,
          created_at: new Date().toISOString(),
        },
      })

      expect(typeof result).toBe('boolean')
    })
  })
})

describe('default decisionEngine singleton', () => {
  it('should be defined', () => {
    expect(decisionEngine).toBeDefined()
  })

  it('should have default rules', () => {
    const rules = decisionEngine.getRules()
    expect(rules.length).toBeGreaterThan(0)
  })
})

import { describe, it, expect } from 'vitest'
import { createDecisionEngine, type DecisionEngineConfig } from './decisionEngine'
import { priorityEscalationRule } from './rules/priorityEscalationRule'
import { statusTransitionRule } from './rules/statusTransitionRule'
import type { EvaluationContext, DecisionEngineOutput } from './types'
import type { Appointment } from '@/features/appointments/types'
import type { DecisionRule } from './rules/types'

// ============================================
// Decision Flow Integration Tests
// ============================================

// Helper to evaluate with specific rules
function evaluateWithRules(
  context: EvaluationContext,
  rules: DecisionRule[]
): DecisionEngineOutput {
  const engine = createDecisionEngine({ rules })
  return engine.evaluate(context)
}

// Helper to create test appointments
function createAppointment(overrides: Partial<Appointment> = {}): Appointment {
  return {
    id: 'test-appointment-id',
    patient_id: 'test-patient-id',
    status: 'CONFIRMED',
    priority: 'LOW',
    scheduled_at: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    reason: 'Test appointment reason',
    specialty: 'General Medicine',
    created_at: new Date().toISOString(),
    ...overrides,
  }
}

// Helper to create a date N days ago
function daysAgo(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString()
}

describe('Decision Flow Integration', () => {
  // ============================================
  // Autonomy Level Flow Tests
  // ============================================

  describe('Autonomy Level Determination', () => {
    it('should return AUTOMATIC when no rules match', () => {
      const context: EvaluationContext = {
        referenceType: 'APPOINTMENT',
        referenceId: 'test-id',
        appointment: createAppointment(),
      }

      const result = evaluateWithRules(context, [])

      expect(result.autonomyLevel).toBe('AUTOMATIC')
      expect(result.weight).toBe('LOW')
      expect(result.confidence).toBe(1.0)
    })

    it('should return SUPERVISED when priority escalation triggers', () => {
      // Appointment pending for 8 days at LOW priority
      const context: EvaluationContext = {
        referenceType: 'APPOINTMENT',
        referenceId: 'test-id',
        appointment: createAppointment({
          priority: 'LOW',
          created_at: daysAgo(8),
        }),
      }

      const result = evaluateWithRules(context, [priorityEscalationRule])

      expect(result.autonomyLevel).toBe('SUPERVISED')
      expect(result.weight).toBe('MEDIUM')
    })

    it('should return BLOCKED for invalid state transitions', () => {
      const previous = createAppointment({ status: 'CANCELLED' })
      const current = createAppointment({ status: 'CONFIRMED' })

      const context: EvaluationContext = {
        referenceType: 'APPOINTMENT',
        referenceId: current.id,
        appointment: current,
        previousAppointment: previous,
      }

      const result = evaluateWithRules(context, [statusTransitionRule])

      expect(result.autonomyLevel).toBe('BLOCKED')
      expect(result.weight).toBe('HIGH')
    })
  })

  // ============================================
  // Priority Escalation Flow Tests
  // ============================================

  describe('Priority Escalation Flow', () => {
    it('should escalate LOW priority after 7 days', () => {
      const context: EvaluationContext = {
        referenceType: 'APPOINTMENT',
        referenceId: 'test-id',
        appointment: createAppointment({
          priority: 'LOW',
          created_at: daysAgo(8),
        }),
      }

      const result = evaluateWithRules(context, [priorityEscalationRule])

      expect(result.autonomyLevel).toBe('SUPERVISED')
      expect(result.weight).toBe('MEDIUM')
    })

    it('should escalate MEDIUM priority after 14 days to BLOCKED', () => {
      const context: EvaluationContext = {
        referenceType: 'APPOINTMENT',
        referenceId: 'test-id',
        appointment: createAppointment({
          priority: 'MEDIUM',
          created_at: daysAgo(15),
        }),
      }

      const result = evaluateWithRules(context, [priorityEscalationRule])

      expect(result.autonomyLevel).toBe('BLOCKED')
      expect(result.weight).toBe('HIGH')
    })

    it('should NOT escalate HIGH priority', () => {
      const context: EvaluationContext = {
        referenceType: 'APPOINTMENT',
        referenceId: 'test-id',
        appointment: createAppointment({
          priority: 'HIGH',
          created_at: daysAgo(30), // Very old
        }),
      }

      const result = evaluateWithRules(context, [priorityEscalationRule])

      expect(result.autonomyLevel).toBe('AUTOMATIC')
    })

    it('should NOT escalate when appointment is fresh', () => {
      const context: EvaluationContext = {
        referenceType: 'APPOINTMENT',
        referenceId: 'test-id',
        appointment: createAppointment({
          priority: 'LOW',
          created_at: daysAgo(3), // Only 3 days old
        }),
      }

      const result = evaluateWithRules(context, [priorityEscalationRule])

      expect(result.autonomyLevel).toBe('AUTOMATIC')
    })

    it('should NOT escalate non-CONFIRMED appointments', () => {
      const context: EvaluationContext = {
        referenceType: 'APPOINTMENT',
        referenceId: 'test-id',
        appointment: createAppointment({
          status: 'CANCELLED',
          priority: 'LOW',
          created_at: daysAgo(30),
        }),
      }

      const result = evaluateWithRules(context, [priorityEscalationRule])

      expect(result.autonomyLevel).toBe('AUTOMATIC')
    })
  })

  // ============================================
  // Status Transition Flow Tests
  // ============================================

  describe('Status Transition Flow', () => {
    it('should allow valid terminal transition with SUPERVISED', () => {
      const previous = createAppointment({ status: 'CONFIRMED' })
      const current = createAppointment({ status: 'ATTENDED' })

      const context: EvaluationContext = {
        referenceType: 'APPOINTMENT',
        referenceId: current.id,
        appointment: current,
        previousAppointment: previous,
      }

      const result = evaluateWithRules(context, [statusTransitionRule])

      expect(result.autonomyLevel).toBe('SUPERVISED')
    })

    it('should block invalid transition from terminal state', () => {
      const previous = createAppointment({ status: 'NO_SHOW' })
      const current = createAppointment({ status: 'RESCHEDULED' })

      const context: EvaluationContext = {
        referenceType: 'APPOINTMENT',
        referenceId: current.id,
        appointment: current,
        previousAppointment: previous,
      }

      const result = evaluateWithRules(context, [statusTransitionRule])

      expect(result.autonomyLevel).toBe('BLOCKED')
      expect(result.confidence).toBe(1.0) // Deterministic
    })

    it('should return AUTOMATIC when no status change', () => {
      const appointment = createAppointment({ status: 'CONFIRMED' })

      const context: EvaluationContext = {
        referenceType: 'APPOINTMENT',
        referenceId: appointment.id,
        appointment,
        previousAppointment: appointment, // Same status
      }

      const result = evaluateWithRules(context, [statusTransitionRule])

      expect(result.autonomyLevel).toBe('AUTOMATIC')
    })
  })

  // ============================================
  // Multi-Rule Evaluation Tests
  // ============================================

  describe('Multi-Rule Evaluation', () => {
    it('should combine results from multiple rules', () => {
      const previous = createAppointment({ status: 'CONFIRMED' })
      const current = createAppointment({
        status: 'ATTENDED',
        priority: 'LOW',
        created_at: daysAgo(8), // Would trigger escalation if status was CONFIRMED
      })

      const context: EvaluationContext = {
        referenceType: 'APPOINTMENT',
        referenceId: current.id,
        appointment: current,
        previousAppointment: previous,
      }

      const result = evaluateWithRules(context, [
        priorityEscalationRule,
        statusTransitionRule,
      ])

      // Status transition rule should trigger (terminal transition)
      expect(result.autonomyLevel).toBe('SUPERVISED')
    })

    it('should prefer BLOCKED over SUPERVISED', () => {
      const previous = createAppointment({ status: 'CANCELLED' })
      const current = createAppointment({
        status: 'CONFIRMED', // Invalid transition
        priority: 'LOW',
      })

      const context: EvaluationContext = {
        referenceType: 'APPOINTMENT',
        referenceId: current.id,
        appointment: current,
        previousAppointment: previous,
      }

      const result = evaluateWithRules(context, [
        priorityEscalationRule,
        statusTransitionRule,
      ])

      // BLOCKED should take precedence
      expect(result.autonomyLevel).toBe('BLOCKED')
    })
  })

  // ============================================
  // Edge Case Tests
  // ============================================

  describe('Edge Cases', () => {
    it('should handle missing appointment in context', () => {
      const context: EvaluationContext = {
        referenceType: 'APPOINTMENT',
        referenceId: 'test-id',
        // No appointment
      }

      const result = evaluateWithRules(context, [
        priorityEscalationRule,
        statusTransitionRule,
      ])

      // Should handle gracefully and return AUTOMATIC
      expect(result).toBeDefined()
      expect(result.autonomyLevel).toBe('AUTOMATIC')
    })

    it('should handle empty rules array', () => {
      const context: EvaluationContext = {
        referenceType: 'APPOINTMENT',
        referenceId: 'test-id',
        appointment: createAppointment(),
      }

      const result = evaluateWithRules(context, [])

      expect(result.autonomyLevel).toBe('AUTOMATIC')
      expect(result.confidence).toBe(1.0)
    })

    it('should handle REQUESTED status (not CONFIRMED)', () => {
      const context: EvaluationContext = {
        referenceType: 'APPOINTMENT',
        referenceId: 'test-id',
        appointment: createAppointment({
          status: 'REQUESTED',
          created_at: daysAgo(30),
        }),
      }

      const result = evaluateWithRules(context, [priorityEscalationRule])

      // Rule only applies to CONFIRMED appointments
      expect(result.autonomyLevel).toBe('AUTOMATIC')
    })
  })

  // ============================================
  // Confidence Score Tests
  // ============================================

  describe('Confidence Scores', () => {
    it('should return high confidence for deterministic rules', () => {
      const previous = createAppointment({ status: 'CANCELLED' })
      const current = createAppointment({ status: 'CONFIRMED' })

      const context: EvaluationContext = {
        referenceType: 'APPOINTMENT',
        referenceId: current.id,
        appointment: current,
        previousAppointment: previous,
      }

      const result = evaluateWithRules(context, [statusTransitionRule])

      expect(result.confidence).toBe(1.0)
    })

    it('should return configured confidence for heuristic rules', () => {
      const context: EvaluationContext = {
        referenceType: 'APPOINTMENT',
        referenceId: 'test-id',
        appointment: createAppointment({
          priority: 'LOW',
          created_at: daysAgo(8),
        }),
      }

      const result = evaluateWithRules(context, [priorityEscalationRule])

      // The rule sets confidence to 0.8 for LOW → MEDIUM escalation
      expect(result.confidence).toBe(0.8)
    })
  })

  // ============================================
  // Decision Engine Instance Tests
  // ============================================

  describe('Decision Engine Instance', () => {
    it('should create engine with custom rules', () => {
      const engine = createDecisionEngine({
        rules: [statusTransitionRule],
      })

      expect(engine.getRules()).toHaveLength(1)
      expect(engine.getRules()[0].id).toBe('status-transition')
    })

    it('should support mutable registry', () => {
      const engine = createDecisionEngine({
        rules: [],
        useMutableRegistry: true,
      })

      const registry = engine.getRegistry()
      expect(registry).not.toBeNull()
    })

    it('should evaluate with default rules when none specified', () => {
      const engine = createDecisionEngine()
      const rules = engine.getRules()

      // Should have default rules
      expect(rules.length).toBeGreaterThan(0)
    })
  })
})

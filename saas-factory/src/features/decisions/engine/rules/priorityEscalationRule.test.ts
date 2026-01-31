import { describe, it, expect } from 'vitest'
import { createPriorityEscalationRule, priorityEscalationRule } from './priorityEscalationRule'
import type { EvaluationContext } from '../types'
import type { Appointment } from '@/features/appointments/types'

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

// Helper to create context
function createContext(appointment: Appointment): EvaluationContext {
  return {
    referenceType: 'APPOINTMENT',
    referenceId: appointment.id,
    appointment,
  }
}

describe('priorityEscalationRule', () => {
  describe('when appointment is not provided', () => {
    it('should return null', () => {
      const context: EvaluationContext = {
        referenceType: 'APPOINTMENT',
        referenceId: 'test-id',
      }

      const result = priorityEscalationRule.evaluate(context)
      expect(result).toBeNull()
    })
  })

  describe('when appointment is not CONFIRMED', () => {
    it('should return null for CANCELLED appointments', () => {
      const appointment = createAppointment({ status: 'CANCELLED' })
      const context = createContext(appointment)

      const result = priorityEscalationRule.evaluate(context)
      expect(result).toBeNull()
    })

    it('should return null for COMPLETED appointments', () => {
      const appointment = createAppointment({ status: 'ATTENDED' })
      const context = createContext(appointment)

      const result = priorityEscalationRule.evaluate(context)
      expect(result).toBeNull()
    })
  })

  describe('when appointment is HIGH priority', () => {
    it('should return null (no escalation needed)', () => {
      const appointment = createAppointment({ priority: 'HIGH' })
      const context = createContext(appointment)

      const result = priorityEscalationRule.evaluate(context)
      expect(result).toBeNull()
    })
  })

  describe('LOW priority escalation', () => {
    it('should return SUPERVISED when pending > 7 days', () => {
      const eightDaysAgo = new Date()
      eightDaysAgo.setDate(eightDaysAgo.getDate() - 8)

      const appointment = createAppointment({
        priority: 'LOW',
        created_at: eightDaysAgo.toISOString(),
      })
      const context = createContext(appointment)

      const result = priorityEscalationRule.evaluate(context)

      expect(result).not.toBeNull()
      expect(result?.autonomyLevel).toBe('SUPERVISED')
      expect(result?.weight).toBe('MEDIUM')
      expect(result?.reason).toContain('8 days')
      expect(result?.reason).toContain('MEDIUM priority')
    })

    it('should return null when pending < 7 days', () => {
      const fiveDaysAgo = new Date()
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5)

      const appointment = createAppointment({
        priority: 'LOW',
        created_at: fiveDaysAgo.toISOString(),
      })
      const context = createContext(appointment)

      const result = priorityEscalationRule.evaluate(context)
      expect(result).toBeNull()
    })
  })

  describe('MEDIUM priority escalation', () => {
    it('should return BLOCKED when pending > 14 days', () => {
      const fifteenDaysAgo = new Date()
      fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15)

      const appointment = createAppointment({
        priority: 'MEDIUM',
        created_at: fifteenDaysAgo.toISOString(),
      })
      const context = createContext(appointment)

      const result = priorityEscalationRule.evaluate(context)

      expect(result).not.toBeNull()
      expect(result?.autonomyLevel).toBe('BLOCKED')
      expect(result?.weight).toBe('HIGH')
      expect(result?.reason).toContain('15 days')
      expect(result?.reason).toContain('HIGH priority')
    })

    it('should return null when pending < 14 days', () => {
      const tenDaysAgo = new Date()
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10)

      const appointment = createAppointment({
        priority: 'MEDIUM',
        created_at: tenDaysAgo.toISOString(),
      })
      const context = createContext(appointment)

      const result = priorityEscalationRule.evaluate(context)
      expect(result).toBeNull()
    })
  })

  describe('custom configuration', () => {
    it('should respect custom thresholds', () => {
      const customRule = createPriorityEscalationRule({
        mediumThresholdDays: 3,
        highThresholdDays: 7,
      })

      const fourDaysAgo = new Date()
      fourDaysAgo.setDate(fourDaysAgo.getDate() - 4)

      const appointment = createAppointment({
        priority: 'LOW',
        created_at: fourDaysAgo.toISOString(),
      })
      const context = createContext(appointment)

      const result = customRule.evaluate(context)
      expect(result).not.toBeNull()
      expect(result?.autonomyLevel).toBe('SUPERVISED')
    })
  })
})

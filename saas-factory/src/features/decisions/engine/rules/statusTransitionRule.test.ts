import { describe, it, expect } from 'vitest'
import { statusTransitionRule } from './statusTransitionRule'
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

describe('statusTransitionRule', () => {
  describe('when there is no status change', () => {
    it('should return null', () => {
      const appointment = createAppointment({ status: 'CONFIRMED' })
      const context: EvaluationContext = {
        referenceType: 'APPOINTMENT',
        referenceId: appointment.id,
        appointment,
        previousAppointment: appointment,
      }

      const result = statusTransitionRule.evaluate(context)
      expect(result).toBeNull()
    })
  })

  describe('when previousAppointment is not provided', () => {
    it('should return null', () => {
      const appointment = createAppointment()
      const context: EvaluationContext = {
        referenceType: 'APPOINTMENT',
        referenceId: appointment.id,
        appointment,
      }

      const result = statusTransitionRule.evaluate(context)
      expect(result).toBeNull()
    })
  })

  describe('valid transitions', () => {
    it('should return SUPERVISED for CONFIRMED → CANCELLED (terminal)', () => {
      const previous = createAppointment({ status: 'CONFIRMED' })
      const current = createAppointment({ status: 'CANCELLED' })

      const context: EvaluationContext = {
        referenceType: 'APPOINTMENT',
        referenceId: current.id,
        appointment: current,
        previousAppointment: previous,
      }

      const result = statusTransitionRule.evaluate(context)

      expect(result).not.toBeNull()
      expect(result?.autonomyLevel).toBe('SUPERVISED')
      expect(result?.weight).toBe('MEDIUM')
      expect(result?.reason).toContain('terminal state')
      expect(result?.reason).toContain('CANCELLED')
    })

    it('should return SUPERVISED for CONFIRMED → COMPLETED (terminal)', () => {
      const previous = createAppointment({ status: 'CONFIRMED' })
      const current = createAppointment({ status: 'ATTENDED' })

      const context: EvaluationContext = {
        referenceType: 'APPOINTMENT',
        referenceId: current.id,
        appointment: current,
        previousAppointment: previous,
      }

      const result = statusTransitionRule.evaluate(context)

      expect(result).not.toBeNull()
      expect(result?.autonomyLevel).toBe('SUPERVISED')
      expect(result?.reason).toContain('ATTENDED')
    })
  })

  describe('invalid transitions', () => {
    it('should return BLOCKED for CANCELLED → CONFIRMED (from terminal)', () => {
      const previous = createAppointment({ status: 'CANCELLED' })
      const current = createAppointment({ status: 'CONFIRMED' })

      const context: EvaluationContext = {
        referenceType: 'APPOINTMENT',
        referenceId: current.id,
        appointment: current,
        previousAppointment: previous,
      }

      const result = statusTransitionRule.evaluate(context)

      expect(result).not.toBeNull()
      expect(result?.autonomyLevel).toBe('BLOCKED')
      expect(result?.weight).toBe('HIGH')
      expect(result?.confidence).toBe(1.0) // Deterministic
      expect(result?.reason).toContain('Invalid status transition')
      expect(result?.reason).toContain('CANCELLED')
      expect(result?.reason).toContain('CONFIRMED')
    })

    it('should return BLOCKED for COMPLETED → CONFIRMED (from terminal)', () => {
      const previous = createAppointment({ status: 'ATTENDED' })
      const current = createAppointment({ status: 'CONFIRMED' })

      const context: EvaluationContext = {
        referenceType: 'APPOINTMENT',
        referenceId: current.id,
        appointment: current,
        previousAppointment: previous,
      }

      const result = statusTransitionRule.evaluate(context)

      expect(result).not.toBeNull()
      expect(result?.autonomyLevel).toBe('BLOCKED')
      expect(result?.reason).toContain('Invalid')
    })
  })
})

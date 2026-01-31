import { describe, it, expect } from 'vitest'
import {
  isValidTransition,
  isTerminalStatus,
  VALID_STATUS_TRANSITIONS,
  TERMINAL_STATUSES,
  createStatusHistoryEntry,
  type AppointmentStatus,
} from '../types'

// ============================================
// State Machine Integration Tests
// ============================================

describe('Appointment State Machine', () => {
  // ============================================
  // Valid Transition Tests
  // ============================================

  describe('Valid Transitions', () => {
    describe('from REQUESTED', () => {
      it('should allow transition to CONFIRMED', () => {
        expect(isValidTransition('REQUESTED', 'CONFIRMED')).toBe(true)
      })

      it('should allow transition to CANCELLED', () => {
        expect(isValidTransition('REQUESTED', 'CANCELLED')).toBe(true)
      })

      it('should NOT allow transition to RESCHEDULED', () => {
        expect(isValidTransition('REQUESTED', 'RESCHEDULED')).toBe(false)
      })

      it('should NOT allow transition to ATTENDED', () => {
        expect(isValidTransition('REQUESTED', 'ATTENDED')).toBe(false)
      })

      it('should NOT allow transition to NO_SHOW', () => {
        expect(isValidTransition('REQUESTED', 'NO_SHOW')).toBe(false)
      })
    })

    describe('from CONFIRMED', () => {
      it('should allow transition to RESCHEDULED', () => {
        expect(isValidTransition('CONFIRMED', 'RESCHEDULED')).toBe(true)
      })

      it('should allow transition to ATTENDED', () => {
        expect(isValidTransition('CONFIRMED', 'ATTENDED')).toBe(true)
      })

      it('should allow transition to NO_SHOW', () => {
        expect(isValidTransition('CONFIRMED', 'NO_SHOW')).toBe(true)
      })

      it('should allow transition to CANCELLED', () => {
        expect(isValidTransition('CONFIRMED', 'CANCELLED')).toBe(true)
      })

      it('should NOT allow transition to REQUESTED', () => {
        expect(isValidTransition('CONFIRMED', 'REQUESTED')).toBe(false)
      })
    })

    describe('from RESCHEDULED', () => {
      it('should allow transition to CONFIRMED', () => {
        expect(isValidTransition('RESCHEDULED', 'CONFIRMED')).toBe(true)
      })

      it('should allow transition to CANCELLED', () => {
        expect(isValidTransition('RESCHEDULED', 'CANCELLED')).toBe(true)
      })

      it('should NOT allow transition to ATTENDED', () => {
        expect(isValidTransition('RESCHEDULED', 'ATTENDED')).toBe(false)
      })

      it('should NOT allow transition to NO_SHOW', () => {
        expect(isValidTransition('RESCHEDULED', 'NO_SHOW')).toBe(false)
      })
    })
  })

  // ============================================
  // Terminal State Tests
  // ============================================

  describe('Terminal States', () => {
    it('ATTENDED should be terminal', () => {
      expect(isTerminalStatus('ATTENDED')).toBe(true)
      expect(VALID_STATUS_TRANSITIONS['ATTENDED']).toEqual([])
    })

    it('NO_SHOW should be terminal', () => {
      expect(isTerminalStatus('NO_SHOW')).toBe(true)
      expect(VALID_STATUS_TRANSITIONS['NO_SHOW']).toEqual([])
    })

    it('CANCELLED should be terminal', () => {
      expect(isTerminalStatus('CANCELLED')).toBe(true)
      expect(VALID_STATUS_TRANSITIONS['CANCELLED']).toEqual([])
    })

    it('REQUESTED should NOT be terminal', () => {
      expect(isTerminalStatus('REQUESTED')).toBe(false)
    })

    it('CONFIRMED should NOT be terminal', () => {
      expect(isTerminalStatus('CONFIRMED')).toBe(false)
    })

    it('RESCHEDULED should NOT be terminal', () => {
      expect(isTerminalStatus('RESCHEDULED')).toBe(false)
    })

    it('should not allow any transitions from terminal states', () => {
      const allStatuses: AppointmentStatus[] = [
        'REQUESTED',
        'CONFIRMED',
        'RESCHEDULED',
        'ATTENDED',
        'NO_SHOW',
        'CANCELLED',
      ]

      for (const terminalStatus of TERMINAL_STATUSES) {
        for (const targetStatus of allStatuses) {
          expect(isValidTransition(terminalStatus, targetStatus)).toBe(false)
        }
      }
    })
  })

  // ============================================
  // Full Flow Tests
  // ============================================

  describe('Full Appointment Flows', () => {
    it('should support happy path: REQUESTED → CONFIRMED → ATTENDED', () => {
      expect(isValidTransition('REQUESTED', 'CONFIRMED')).toBe(true)
      expect(isValidTransition('CONFIRMED', 'ATTENDED')).toBe(true)
      expect(isTerminalStatus('ATTENDED')).toBe(true)
    })

    it('should support cancellation from REQUESTED: REQUESTED → CANCELLED', () => {
      expect(isValidTransition('REQUESTED', 'CANCELLED')).toBe(true)
      expect(isTerminalStatus('CANCELLED')).toBe(true)
    })

    it('should support cancellation from CONFIRMED: CONFIRMED → CANCELLED', () => {
      expect(isValidTransition('CONFIRMED', 'CANCELLED')).toBe(true)
      expect(isTerminalStatus('CANCELLED')).toBe(true)
    })

    it('should support no-show flow: REQUESTED → CONFIRMED → NO_SHOW', () => {
      expect(isValidTransition('REQUESTED', 'CONFIRMED')).toBe(true)
      expect(isValidTransition('CONFIRMED', 'NO_SHOW')).toBe(true)
      expect(isTerminalStatus('NO_SHOW')).toBe(true)
    })

    it('should support reschedule flow: CONFIRMED → RESCHEDULED → CONFIRMED → ATTENDED', () => {
      expect(isValidTransition('CONFIRMED', 'RESCHEDULED')).toBe(true)
      expect(isValidTransition('RESCHEDULED', 'CONFIRMED')).toBe(true)
      expect(isValidTransition('CONFIRMED', 'ATTENDED')).toBe(true)
    })

    it('should support multiple reschedules: RESCHEDULED → CONFIRMED → RESCHEDULED', () => {
      expect(isValidTransition('RESCHEDULED', 'CONFIRMED')).toBe(true)
      expect(isValidTransition('CONFIRMED', 'RESCHEDULED')).toBe(true)
    })

    it('should support cancellation after reschedule: RESCHEDULED → CANCELLED', () => {
      expect(isValidTransition('RESCHEDULED', 'CANCELLED')).toBe(true)
      expect(isTerminalStatus('CANCELLED')).toBe(true)
    })
  })

  // ============================================
  // Invalid Transition Tests
  // ============================================

  describe('Invalid Transitions', () => {
    it('should NOT allow skipping CONFIRMED: REQUESTED → ATTENDED', () => {
      expect(isValidTransition('REQUESTED', 'ATTENDED')).toBe(false)
    })

    it('should NOT allow backwards: CONFIRMED → REQUESTED', () => {
      expect(isValidTransition('CONFIRMED', 'REQUESTED')).toBe(false)
    })

    it('should NOT allow revival from terminal: CANCELLED → CONFIRMED', () => {
      expect(isValidTransition('CANCELLED', 'CONFIRMED')).toBe(false)
    })

    it('should NOT allow revival from terminal: ATTENDED → RESCHEDULED', () => {
      expect(isValidTransition('ATTENDED', 'RESCHEDULED')).toBe(false)
    })

    it('should NOT allow NO_SHOW before confirmation: REQUESTED → NO_SHOW', () => {
      expect(isValidTransition('REQUESTED', 'NO_SHOW')).toBe(false)
    })

    it('should NOT allow attending from RESCHEDULED without confirmation', () => {
      expect(isValidTransition('RESCHEDULED', 'ATTENDED')).toBe(false)
    })
  })

  // ============================================
  // Status History Tests
  // ============================================

  describe('Status History', () => {
    it('should create status history entry with all fields', () => {
      const entry = createStatusHistoryEntry('CONFIRMED', 'Patient confirmed via phone', 'user-123')

      expect(entry.status).toBe('CONFIRMED')
      expect(entry.reason).toBe('Patient confirmed via phone')
      expect(entry.changed_by).toBe('user-123')
      expect(entry.occurred_at).toBeDefined()
      expect(new Date(entry.occurred_at).getTime()).toBeLessThanOrEqual(Date.now())
    })

    it('should create entry without optional fields', () => {
      const entry = createStatusHistoryEntry('CANCELLED')

      expect(entry.status).toBe('CANCELLED')
      expect(entry.reason).toBeUndefined()
      expect(entry.changed_by).toBeUndefined()
    })

    it('should create unique timestamps for sequential entries', async () => {
      const entry1 = createStatusHistoryEntry('REQUESTED')
      await new Promise((r) => setTimeout(r, 10))
      const entry2 = createStatusHistoryEntry('CONFIRMED')

      expect(entry1.occurred_at).not.toBe(entry2.occurred_at)
    })
  })

  // ============================================
  // Edge Cases
  // ============================================

  describe('Edge Cases', () => {
    it('should handle self-transition (same status)', () => {
      // Self-transitions are not in the valid transitions list
      expect(isValidTransition('CONFIRMED', 'CONFIRMED')).toBe(false)
      expect(isValidTransition('REQUESTED', 'REQUESTED')).toBe(false)
    })

    it('should verify all statuses have defined transitions', () => {
      const allStatuses: AppointmentStatus[] = [
        'REQUESTED',
        'CONFIRMED',
        'RESCHEDULED',
        'ATTENDED',
        'NO_SHOW',
        'CANCELLED',
      ]

      for (const status of allStatuses) {
        expect(VALID_STATUS_TRANSITIONS[status]).toBeDefined()
        expect(Array.isArray(VALID_STATUS_TRANSITIONS[status])).toBe(true)
      }
    })

    it('should have exactly 3 terminal statuses', () => {
      expect(TERMINAL_STATUSES).toHaveLength(3)
      expect(TERMINAL_STATUSES).toContain('ATTENDED')
      expect(TERMINAL_STATUSES).toContain('NO_SHOW')
      expect(TERMINAL_STATUSES).toContain('CANCELLED')
    })
  })
})

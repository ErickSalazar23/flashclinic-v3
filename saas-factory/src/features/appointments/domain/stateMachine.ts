import type { AppointmentStatus, StatusHistoryEntry } from '../types'
import {
  VALID_STATUS_TRANSITIONS,
  TERMINAL_STATUSES,
  isValidTransition,
  isTerminalStatus,
  createStatusHistoryEntry,
} from '../types'

// ============================================
// Appointment State Machine
// ============================================

/**
 * Result of a state transition attempt.
 */
export type TransitionResult =
  | { ok: true; newStatus: AppointmentStatus; historyEntry: StatusHistoryEntry }
  | { ok: false; error: string; code: 'INVALID_TRANSITION' | 'TERMINAL_STATE' }

/**
 * State machine for appointment status transitions.
 *
 * Valid transitions (from legacy FlashClinic):
 * - REQUESTED → [CONFIRMED, CANCELLED]
 * - CONFIRMED → [RESCHEDULED, ATTENDED, NO_SHOW, CANCELLED]
 * - RESCHEDULED → [CONFIRMED, CANCELLED]
 * - ATTENDED → (terminal)
 * - NO_SHOW → (terminal)
 * - CANCELLED → (terminal)
 */
export const appointmentStateMachine = {
  /**
   * Attempts to transition to a new status.
   */
  transition(
    currentStatus: AppointmentStatus,
    targetStatus: AppointmentStatus,
    reason?: string,
    changedBy?: string
  ): TransitionResult {
    // Check if current status is terminal
    if (isTerminalStatus(currentStatus)) {
      return {
        ok: false,
        error: `Cannot transition from terminal status: ${currentStatus}`,
        code: 'TERMINAL_STATE',
      }
    }

    // Check if transition is valid
    if (!isValidTransition(currentStatus, targetStatus)) {
      const validTargets = VALID_STATUS_TRANSITIONS[currentStatus]
      return {
        ok: false,
        error: `Invalid transition from ${currentStatus} to ${targetStatus}. Valid transitions: ${validTargets.join(', ') || 'none'}`,
        code: 'INVALID_TRANSITION',
      }
    }

    return {
      ok: true,
      newStatus: targetStatus,
      historyEntry: createStatusHistoryEntry(targetStatus, reason, changedBy),
    }
  },

  /**
   * Gets available transitions from current status.
   */
  getAvailableTransitions(currentStatus: AppointmentStatus): AppointmentStatus[] {
    return VALID_STATUS_TRANSITIONS[currentStatus]
  },

  /**
   * Checks if an appointment can be confirmed.
   */
  canConfirm(currentStatus: AppointmentStatus): boolean {
    return isValidTransition(currentStatus, 'CONFIRMED')
  },

  /**
   * Checks if an appointment can be cancelled.
   */
  canCancel(currentStatus: AppointmentStatus): boolean {
    return isValidTransition(currentStatus, 'CANCELLED')
  },

  /**
   * Checks if an appointment can be rescheduled.
   */
  canReschedule(currentStatus: AppointmentStatus): boolean {
    return isValidTransition(currentStatus, 'RESCHEDULED')
  },

  /**
   * Checks if an appointment can be marked as attended.
   */
  canMarkAttended(currentStatus: AppointmentStatus): boolean {
    return isValidTransition(currentStatus, 'ATTENDED')
  },

  /**
   * Checks if an appointment can be marked as no-show.
   */
  canMarkNoShow(currentStatus: AppointmentStatus): boolean {
    return isValidTransition(currentStatus, 'NO_SHOW')
  },

  /**
   * Checks if an appointment can be modified (not terminal).
   */
  canModify(currentStatus: AppointmentStatus): boolean {
    return !isTerminalStatus(currentStatus)
  },

  /**
   * Checks if a status is terminal.
   */
  isTerminal(status: AppointmentStatus): boolean {
    return isTerminalStatus(status)
  },

  /**
   * Gets all terminal statuses.
   */
  getTerminalStatuses(): AppointmentStatus[] {
    return TERMINAL_STATUSES
  },
}

// ============================================
// State Transition Actions
// ============================================

/**
 * Creates a confirm transition (REQUESTED|RESCHEDULED → CONFIRMED).
 */
export function createConfirmTransition(
  currentStatus: AppointmentStatus,
  reason?: string,
  changedBy?: string
): TransitionResult {
  return appointmentStateMachine.transition(currentStatus, 'CONFIRMED', reason, changedBy)
}

/**
 * Creates a cancel transition (any non-terminal → CANCELLED).
 */
export function createCancelTransition(
  currentStatus: AppointmentStatus,
  reason?: string,
  changedBy?: string
): TransitionResult {
  return appointmentStateMachine.transition(currentStatus, 'CANCELLED', reason, changedBy)
}

/**
 * Creates a reschedule transition (CONFIRMED → RESCHEDULED).
 */
export function createRescheduleTransition(
  currentStatus: AppointmentStatus,
  reason?: string,
  changedBy?: string
): TransitionResult {
  return appointmentStateMachine.transition(currentStatus, 'RESCHEDULED', reason, changedBy)
}

/**
 * Creates an attended transition (CONFIRMED → ATTENDED).
 */
export function createAttendedTransition(
  currentStatus: AppointmentStatus,
  reason?: string,
  changedBy?: string
): TransitionResult {
  return appointmentStateMachine.transition(currentStatus, 'ATTENDED', reason, changedBy)
}

/**
 * Creates a no-show transition (CONFIRMED → NO_SHOW).
 */
export function createNoShowTransition(
  currentStatus: AppointmentStatus,
  reason?: string,
  changedBy?: string
): TransitionResult {
  return appointmentStateMachine.transition(currentStatus, 'NO_SHOW', reason, changedBy)
}

// ============================================
// History Utilities
// ============================================

/**
 * Appends a history entry to existing history.
 */
export function appendToHistory(
  existingHistory: StatusHistoryEntry[] | undefined,
  newEntry: StatusHistoryEntry
): StatusHistoryEntry[] {
  return [...(existingHistory || []), newEntry]
}

/**
 * Gets the most recent status from history.
 */
export function getLatestHistoryEntry(
  history: StatusHistoryEntry[] | undefined
): StatusHistoryEntry | undefined {
  if (!history || history.length === 0) return undefined
  return history[history.length - 1]
}

/**
 * Calculates time spent in each status.
 */
export function calculateStatusDurations(
  history: StatusHistoryEntry[]
): Record<AppointmentStatus, number> {
  const durations: Partial<Record<AppointmentStatus, number>> = {}

  for (let i = 0; i < history.length; i++) {
    const current = history[i]
    const next = history[i + 1]

    const startTime = new Date(current.occurred_at).getTime()
    const endTime = next
      ? new Date(next.occurred_at).getTime()
      : Date.now()

    const duration = endTime - startTime
    durations[current.status] = (durations[current.status] || 0) + duration
  }

  // Ensure all statuses have a value
  const allStatuses: AppointmentStatus[] = [
    'REQUESTED', 'CONFIRMED', 'RESCHEDULED', 'ATTENDED', 'NO_SHOW', 'CANCELLED'
  ]

  return allStatuses.reduce((acc, status) => {
    acc[status] = durations[status] || 0
    return acc
  }, {} as Record<AppointmentStatus, number>)
}

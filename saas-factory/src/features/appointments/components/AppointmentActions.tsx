'use client'

import { useState } from 'react'
import type { AppointmentStatus } from '../types'
import { appointmentStateMachine } from '../domain'

// ============================================
// Appointment Actions Component
// ============================================

interface AppointmentActionsProps {
  appointmentId: string
  currentStatus: AppointmentStatus
  onConfirm?: () => Promise<void>
  onCancel?: () => Promise<void>
  onReschedule?: () => void // Opens modal
  onMarkAttended?: () => Promise<void>
  onMarkNoShow?: () => Promise<void>
  disabled?: boolean
  layout?: 'horizontal' | 'vertical'
}

export function AppointmentActions({
  appointmentId,
  currentStatus,
  onConfirm,
  onCancel,
  onReschedule,
  onMarkAttended,
  onMarkNoShow,
  disabled = false,
  layout = 'horizontal',
}: AppointmentActionsProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const canConfirm = appointmentStateMachine.canConfirm(currentStatus)
  const canCancel = appointmentStateMachine.canCancel(currentStatus)
  const canReschedule = appointmentStateMachine.canReschedule(currentStatus)
  const canMarkAttended = appointmentStateMachine.canMarkAttended(currentStatus)
  const canMarkNoShow = appointmentStateMachine.canMarkNoShow(currentStatus)

  const isTerminal = appointmentStateMachine.isTerminal(currentStatus)

  async function handleAction(
    action: (() => Promise<void>) | undefined,
    actionName: string
  ) {
    if (!action || disabled || loading) return

    setLoading(actionName)
    setError(null)

    try {
      await action()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed')
    } finally {
      setLoading(null)
    }
  }

  if (isTerminal) {
    return (
      <div className="text-sm text-gray-500 italic">
        No actions available for {currentStatus.toLowerCase()} appointments
      </div>
    )
  }

  const containerClass = layout === 'horizontal'
    ? 'flex flex-wrap gap-2'
    : 'flex flex-col gap-2'

  return (
    <div className="space-y-2">
      {error && (
        <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">
          {error}
        </div>
      )}

      <div className={containerClass}>
        {/* Confirm Button */}
        {canConfirm && onConfirm && (
          <button
            onClick={() => handleAction(onConfirm, 'confirm')}
            disabled={disabled || loading !== null}
            className="px-3 py-2 text-sm font-medium text-green-700 bg-green-50 rounded-md hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading === 'confirm' ? 'Confirming...' : 'Confirm'}
          </button>
        )}

        {/* Reschedule Button */}
        {canReschedule && onReschedule && (
          <button
            onClick={onReschedule}
            disabled={disabled || loading !== null}
            className="px-3 py-2 text-sm font-medium text-purple-700 bg-purple-50 rounded-md hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reschedule
          </button>
        )}

        {/* Mark Attended Button */}
        {canMarkAttended && onMarkAttended && (
          <button
            onClick={() => handleAction(onMarkAttended, 'attended')}
            disabled={disabled || loading !== null}
            className="px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading === 'attended' ? 'Marking...' : 'Mark Attended'}
          </button>
        )}

        {/* Mark No-Show Button */}
        {canMarkNoShow && onMarkNoShow && (
          <button
            onClick={() => handleAction(onMarkNoShow, 'noshow')}
            disabled={disabled || loading !== null}
            className="px-3 py-2 text-sm font-medium text-orange-700 bg-orange-50 rounded-md hover:bg-orange-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading === 'noshow' ? 'Marking...' : 'Mark No-Show'}
          </button>
        )}

        {/* Cancel Button */}
        {canCancel && onCancel && (
          <button
            onClick={() => handleAction(onCancel, 'cancel')}
            disabled={disabled || loading !== null}
            className="px-3 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-md hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading === 'cancel' ? 'Cancelling...' : 'Cancel'}
          </button>
        )}
      </div>

      {/* Available transitions hint */}
      <div className="text-xs text-gray-400">
        Available: {appointmentStateMachine.getAvailableTransitions(currentStatus).join(', ') || 'None'}
      </div>
    </div>
  )
}

// ============================================
// Quick Action Buttons (Compact)
// ============================================

interface QuickActionsProps {
  currentStatus: AppointmentStatus
  onAction: (targetStatus: AppointmentStatus) => void
  disabled?: boolean
}

export function QuickActions({ currentStatus, onAction, disabled = false }: QuickActionsProps) {
  const availableTransitions = appointmentStateMachine.getAvailableTransitions(currentStatus)

  if (availableTransitions.length === 0) {
    return null
  }

  const actionConfig: Record<AppointmentStatus, { label: string; className: string }> = {
    REQUESTED: { label: 'Request', className: 'text-yellow-600 hover:text-yellow-800' },
    CONFIRMED: { label: 'Confirm', className: 'text-green-600 hover:text-green-800' },
    RESCHEDULED: { label: 'Reschedule', className: 'text-purple-600 hover:text-purple-800' },
    ATTENDED: { label: 'Attended', className: 'text-blue-600 hover:text-blue-800' },
    NO_SHOW: { label: 'No-Show', className: 'text-orange-600 hover:text-orange-800' },
    CANCELLED: { label: 'Cancel', className: 'text-red-600 hover:text-red-800' },
  }

  return (
    <div className="flex gap-2">
      {availableTransitions.map((status) => (
        <button
          key={status}
          onClick={() => onAction(status)}
          disabled={disabled}
          className={`text-sm font-medium disabled:opacity-50 ${actionConfig[status].className}`}
        >
          {actionConfig[status].label}
        </button>
      ))}
    </div>
  )
}

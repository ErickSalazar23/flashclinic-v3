'use client'

import type { Appointment, AppointmentStatus } from '../types'
import { formatPriority, getPriorityColorClass, daysUntilAppointment } from '../types'
import { appointmentStateMachine } from '../domain'
import { AppointmentStatusBadge } from './AppointmentStatusBadge'

// ============================================
// Appointment Card Component
// ============================================

interface AppointmentCardProps {
  appointment: Appointment
  patientName?: string
  onConfirm?: () => void
  onCancel?: () => void
  onReschedule?: () => void
  onMarkAttended?: () => void
  onMarkNoShow?: () => void
}

export function AppointmentCard({
  appointment,
  patientName,
  onConfirm,
  onCancel,
  onReschedule,
  onMarkAttended,
  onMarkNoShow,
}: AppointmentCardProps) {
  const daysUntil = daysUntilAppointment(appointment.scheduled_at)
  const canConfirm = appointmentStateMachine.canConfirm(appointment.status)
  const canCancel = appointmentStateMachine.canCancel(appointment.status)
  const canReschedule = appointmentStateMachine.canReschedule(appointment.status)
  const canMarkAttended = appointmentStateMachine.canMarkAttended(appointment.status)
  const canMarkNoShow = appointmentStateMachine.canMarkNoShow(appointment.status)
  const isTerminal = appointmentStateMachine.isTerminal(appointment.status)

  function formatDateTime(dateStr: string) {
    const date = new Date(dateStr)
    return {
      date: date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      }),
    }
  }

  const { date, time } = formatDateTime(appointment.scheduled_at)

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            {appointment.specialty}
          </h3>
          {patientName && (
            <p className="text-sm text-gray-500">{patientName}</p>
          )}
        </div>
        <div className="flex gap-2">
          <AppointmentStatusBadge status={appointment.status} />
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColorClass(
              appointment.priority
            )}`}
          >
            {formatPriority(appointment.priority)}
          </span>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center text-sm">
          <svg
            className="h-5 w-5 text-gray-400 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-gray-900">{date}</span>
        </div>

        <div className="flex items-center text-sm">
          <svg
            className="h-5 w-5 text-gray-400 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-gray-900">{time}</span>
        </div>

        {daysUntil > 0 && appointment.status === 'CONFIRMED' && (
          <div className="text-sm text-gray-500">
            {daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`}
          </div>
        )}
      </div>

      {appointment.reason && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            <span className="font-medium">Reason:</span> {appointment.reason}
          </p>
        </div>
      )}

      {!isTerminal && (
        <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-2">
          {canConfirm && onConfirm && (
            <button
              onClick={onConfirm}
              className="flex-1 px-3 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-md hover:bg-green-100"
            >
              Confirm
            </button>
          )}
          {canReschedule && onReschedule && (
            <button
              onClick={onReschedule}
              className="flex-1 px-3 py-2 text-sm font-medium text-purple-600 bg-purple-50 rounded-md hover:bg-purple-100"
            >
              Reschedule
            </button>
          )}
          {canMarkAttended && onMarkAttended && (
            <button
              onClick={onMarkAttended}
              className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
            >
              Mark Attended
            </button>
          )}
          {canMarkNoShow && onMarkNoShow && (
            <button
              onClick={onMarkNoShow}
              className="flex-1 px-3 py-2 text-sm font-medium text-orange-600 bg-orange-50 rounded-md hover:bg-orange-100"
            >
              No-Show
            </button>
          )}
          {canCancel && onCancel && (
            <button
              onClick={onCancel}
              className="flex-1 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100"
            >
              Cancel
            </button>
          )}
        </div>
      )}
    </div>
  )
}

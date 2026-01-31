'use client'

import type { AppointmentStatus } from '../types'
import { formatStatus, getStatusColorClass, isTerminalStatus } from '../types'

// ============================================
// Appointment Status Badge Component
// ============================================

interface AppointmentStatusBadgeProps {
  status: AppointmentStatus
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
}

const STATUS_ICONS: Record<AppointmentStatus, string> = {
  REQUESTED: '⏳',
  CONFIRMED: '✓',
  RESCHEDULED: '📅',
  ATTENDED: '✅',
  NO_SHOW: '❌',
  CANCELLED: '🚫',
}

const SIZE_CLASSES = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-0.5 text-xs',
  lg: 'px-3 py-1 text-sm',
}

export function AppointmentStatusBadge({
  status,
  size = 'md',
  showIcon = false,
}: AppointmentStatusBadgeProps) {
  const colorClass = getStatusColorClass(status)
  const sizeClass = SIZE_CLASSES[size]
  const isTerminal = isTerminalStatus(status)

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${colorClass} ${sizeClass}`}
      title={isTerminal ? 'Final status - no further changes possible' : undefined}
    >
      {showIcon && <span>{STATUS_ICONS[status]}</span>}
      <span>{formatStatus(status)}</span>
      {isTerminal && (
        <span className="ml-0.5 opacity-60" title="Terminal status">
          •
        </span>
      )}
    </span>
  )
}

// ============================================
// Status Timeline Component
// ============================================

interface StatusHistoryEntry {
  status: AppointmentStatus
  occurred_at: string
  reason?: string
  changed_by?: string
}

interface StatusTimelineProps {
  history: StatusHistoryEntry[]
  currentStatus: AppointmentStatus
}

export function StatusTimeline({ history, currentStatus }: StatusTimelineProps) {
  if (!history || history.length === 0) {
    return (
      <div className="text-sm text-gray-500">
        No status history available
      </div>
    )
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {history.map((entry, idx) => {
          const isLast = idx === history.length - 1
          const isCurrent = entry.status === currentStatus && isLast

          return (
            <li key={`${entry.status}-${entry.occurred_at}`}>
              <div className="relative pb-8">
                {!isLast && (
                  <span
                    className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex space-x-3">
                  <div>
                    <span
                      className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                        isCurrent ? 'bg-blue-500' : 'bg-gray-400'
                      }`}
                    >
                      <span className="text-white text-sm">
                        {STATUS_ICONS[entry.status]}
                      </span>
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                    <div>
                      <p className="text-sm text-gray-900">
                        {formatStatus(entry.status)}
                        {isCurrent && (
                          <span className="ml-2 text-blue-600 font-medium">
                            (Current)
                          </span>
                        )}
                      </p>
                      {entry.reason && (
                        <p className="mt-0.5 text-xs text-gray-500">
                          {entry.reason}
                        </p>
                      )}
                    </div>
                    <div className="whitespace-nowrap text-right text-sm text-gray-500">
                      {new Date(entry.occurred_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

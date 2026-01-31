'use client'

import type { PendingDecision, DecisionWeight } from '../types'

// ============================================
// Pending Decision Card Component
// ============================================

interface PendingDecisionCardProps {
  decision: PendingDecision & { patient?: { full_name: string; email: string } }
  onApprove?: () => void
  onReject?: () => void
  isLoading?: boolean
}

const WEIGHT_CONFIG: Record<DecisionWeight, { label: string; className: string; icon: string }> = {
  HIGH: {
    label: 'High Priority',
    className: 'bg-red-100 text-red-800 border-red-200',
    icon: '🔴',
  },
  MEDIUM: {
    label: 'Medium Priority',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: '🟡',
  },
  LOW: {
    label: 'Low Priority',
    className: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: '⚪',
  },
}

export function PendingDecisionCard({
  decision,
  onApprove,
  onReject,
  isLoading = false,
}: PendingDecisionCardProps) {
  const weightConfig = WEIGHT_CONFIG[decision.weight]
  const isResolved = decision.resolved_at !== null
  const appointmentData = decision.appointment_data as Record<string, unknown> | null

  function formatDateTime(dateStr: string) {
    return new Date(dateStr).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  return (
    <div
      className={`bg-white rounded-lg shadow border-l-4 ${
        isResolved ? 'border-gray-300 opacity-75' : `border-l-4 ${
          decision.weight === 'HIGH' ? 'border-red-500' :
          decision.weight === 'MEDIUM' ? 'border-yellow-500' : 'border-gray-400'
        }`
      }`}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${weightConfig.className}`}
            >
              {weightConfig.icon} {weightConfig.label}
            </span>
            {decision.autonomy_level && (
              <span className="text-xs text-gray-500">
                {decision.autonomy_level}
              </span>
            )}
          </div>
          <span className="text-xs text-gray-400">
            {formatDateTime(decision.created_at)}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-3 space-y-3">
        {/* Patient Info */}
        {decision.patient && (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 text-sm font-medium">
                {decision.patient.full_name.charAt(0)}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {decision.patient.full_name}
              </p>
              <p className="text-xs text-gray-500">{decision.patient.email}</p>
            </div>
          </div>
        )}

        {/* Appointment Details */}
        {appointmentData && (
          <div className="bg-gray-50 rounded-md p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Specialty:</span>
              <span className="text-gray-900 font-medium">
                {String(appointmentData.specialty || '')}
              </span>
            </div>
            {appointmentData.scheduled_at ? (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Scheduled:</span>
                <span className="text-gray-900">
                  {formatDateTime(String(appointmentData.scheduled_at))}
                </span>
              </div>
            ) : null}
            {appointmentData.reason ? (
              <div className="text-sm">
                <span className="text-gray-500">Reason:</span>
                <p className="text-gray-900 mt-0.5">
                  {String(appointmentData.reason)}
                </p>
              </div>
            ) : null}
          </div>
        )}

        {/* Decision Reason */}
        <div className="text-sm">
          <p className="text-gray-500 text-xs uppercase font-medium mb-1">
            Why Review Needed
          </p>
          <p className="text-gray-700">{decision.reason}</p>
        </div>

        {/* Resolution Info (if resolved) */}
        {isResolved && (
          <div
            className={`rounded-md p-3 ${
              decision.resolution_type === 'APPROVED'
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}
          >
            <p className="text-sm font-medium">
              {decision.resolution_type === 'APPROVED' ? '✅ Approved' : '❌ Rejected'}
            </p>
            {decision.resolution_notes && (
              <p className="text-sm text-gray-600 mt-1">
                {decision.resolution_notes}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {decision.resolved_at && formatDateTime(decision.resolved_at)}
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      {!isResolved && (onApprove || onReject) && (
        <div className="px-4 py-3 border-t border-gray-100 flex gap-2">
          {onApprove && (
            <button
              onClick={onApprove}
              disabled={isLoading}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Processing...' : 'Approve'}
            </button>
          )}
          {onReject && (
            <button
              onClick={onReject}
              disabled={isLoading}
              className="flex-1 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reject
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ============================================
// Decision Weight Badge
// ============================================

interface WeightBadgeProps {
  weight: DecisionWeight
  size?: 'sm' | 'md'
}

export function WeightBadge({ weight, size = 'md' }: WeightBadgeProps) {
  const config = WEIGHT_CONFIG[weight]
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${config.className} ${sizeClass}`}
    >
      {config.icon} {config.label}
    </span>
  )
}

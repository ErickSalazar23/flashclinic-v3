'use client'

import { useState } from 'react'
import type { PendingDecision } from '../types'
import { WeightBadge } from './PendingDecisionCard'

// ============================================
// Approval Modal Component
// ============================================

interface ApprovalModalProps {
  decision: PendingDecision & { patient?: { full_name: string; email: string } }
  isOpen: boolean
  onClose: () => void
  onApprove: (notes?: string) => Promise<void>
  onReject: (reason: string) => Promise<void>
}

export function ApprovalModal({
  decision,
  isOpen,
  onClose,
  onApprove,
  onReject,
}: ApprovalModalProps) {
  const [mode, setMode] = useState<'view' | 'approve' | 'reject'>('view')
  const [notes, setNotes] = useState('')
  const [rejectReason, setRejectReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  async function handleApprove() {
    setError(null)
    setIsSubmitting(true)

    try {
      await onApprove(notes || undefined)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleReject() {
    if (rejectReason.trim().length < 5) {
      setError('Please provide a reason (at least 5 characters)')
      return
    }

    setError(null)
    setIsSubmitting(true)

    try {
      await onReject(rejectReason.trim())
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject')
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleClose() {
    if (!isSubmitting) {
      setMode('view')
      setNotes('')
      setRejectReason('')
      setError(null)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg transform overflow-hidden rounded-lg bg-white shadow-xl transition-all">
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Review Decision
              </h3>
              <WeightBadge weight={decision.weight} size="sm" />
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
            {/* Error */}
            {error && (
              <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">
                {error}
              </div>
            )}

            {/* Patient Info */}
            {decision.patient && (
              <div className="bg-blue-50 rounded-md p-3">
                <p className="text-xs text-blue-600 uppercase font-medium">Patient</p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {decision.patient.full_name}
                </p>
                <p className="text-sm text-gray-600">{decision.patient.email}</p>
              </div>
            )}

            {/* Appointment Details */}
            {appointmentData && (
              <div className="space-y-3">
                <p className="text-xs text-gray-500 uppercase font-medium">
                  Appointment Request
                </p>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500">Specialty</p>
                    <p className="font-medium">{String(appointmentData.specialty || '')}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Priority</p>
                    <p className="font-medium">{String(appointmentData.priority || 'LOW')}</p>
                  </div>
                  {appointmentData.scheduled_at ? (
                    <div className="col-span-2">
                      <p className="text-gray-500">Scheduled For</p>
                      <p className="font-medium">
                        {formatDateTime(String(appointmentData.scheduled_at))}
                      </p>
                    </div>
                  ) : null}
                  {appointmentData.reason ? (
                    <div className="col-span-2">
                      <p className="text-gray-500">Reason</p>
                      <p className="text-gray-900">{String(appointmentData.reason)}</p>
                    </div>
                  ) : null}
                </div>
              </div>
            )}

            {/* Decision Reason */}
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium">
                Why Review is Required
              </p>
              <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">{decision.reason}</p>
              </div>
            </div>

            {/* Autonomy Level */}
            {decision.autonomy_level && (
              <div className="text-sm">
                <span className="text-gray-500">Autonomy Level: </span>
                <span className={`font-medium ${
                  decision.autonomy_level === 'BLOCKED' ? 'text-red-600' : 'text-yellow-600'
                }`}>
                  {decision.autonomy_level}
                </span>
              </div>
            )}

            {/* Approve Mode */}
            {mode === 'approve' && (
              <div className="pt-4 border-t border-gray-200">
                <label className="block text-sm font-medium text-gray-700">
                  Approval Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  disabled={isSubmitting}
                  placeholder="Add any notes about this approval..."
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 disabled:bg-gray-100"
                />
              </div>
            )}

            {/* Reject Mode */}
            {mode === 'reject' && (
              <div className="pt-4 border-t border-gray-200">
                <label className="block text-sm font-medium text-gray-700">
                  Rejection Reason *
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                  required
                  disabled={isSubmitting}
                  placeholder="Why is this request being rejected?"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 disabled:bg-gray-100"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Minimum 5 characters required
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4">
            {mode === 'view' && (
              <div className="flex gap-3">
                <button
                  onClick={() => setMode('approve')}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                >
                  Approve
                </button>
                <button
                  onClick={() => setMode('reject')}
                  className="flex-1 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100"
                >
                  Reject
                </button>
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            )}

            {mode === 'approve' && (
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setMode('view')}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  onClick={handleApprove}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Approving...' : 'Confirm Approval'}
                </button>
              </div>
            )}

            {mode === 'reject' && (
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setMode('view')}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  onClick={handleReject}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

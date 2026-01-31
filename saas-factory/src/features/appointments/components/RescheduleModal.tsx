'use client'

import { useState } from 'react'
import type { Appointment } from '../types'

// ============================================
// Reschedule Modal Component
// ============================================

interface RescheduleModalProps {
  appointment: Appointment
  isOpen: boolean
  onClose: () => void
  onReschedule: (newScheduledAt: string, reason: string) => Promise<void>
}

export function RescheduleModal({
  appointment,
  isOpen,
  onClose,
  onReschedule,
}: RescheduleModalProps) {
  const [newDate, setNewDate] = useState('')
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get minimum date (tomorrow)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().slice(0, 16)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!newDate) {
      setError('Please select a new date and time')
      return
    }

    if (!reason.trim()) {
      setError('Please provide a reason for rescheduling')
      return
    }

    setIsSubmitting(true)

    try {
      await onReschedule(newDate, reason)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reschedule')
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleClose() {
    if (!isSubmitting) {
      setNewDate('')
      setReason('')
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
        <div className="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white shadow-xl transition-all">
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Reschedule Appointment
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {appointment.specialty} appointment
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-4 space-y-4">
              {/* Current Schedule */}
              <div className="bg-gray-50 rounded-md p-3">
                <p className="text-xs text-gray-500 uppercase font-medium">
                  Current Schedule
                </p>
                <p className="text-sm text-gray-900 mt-1">
                  {new Date(appointment.scheduled_at).toLocaleString()}
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">
                  {error}
                </div>
              )}

              {/* New Date/Time */}
              <div>
                <label
                  htmlFor="new-date"
                  className="block text-sm font-medium text-gray-700"
                >
                  New Date & Time *
                </label>
                <input
                  type="datetime-local"
                  id="new-date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  min={minDate}
                  required
                  disabled={isSubmitting}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>

              {/* Reason */}
              <div>
                <label
                  htmlFor="reason"
                  className="block text-sm font-medium text-gray-700"
                >
                  Reason for Rescheduling *
                </label>
                <textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  required
                  disabled={isSubmitting}
                  placeholder="Why is this appointment being rescheduled?"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Rescheduling...' : 'Reschedule'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// ============================================
// Cancel Confirmation Modal
// ============================================

interface CancelConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (reason: string) => Promise<void>
  appointmentInfo?: string
}

export function CancelConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  appointmentInfo,
}: CancelConfirmModalProps) {
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleConfirm() {
    setError(null)
    setIsSubmitting(true)

    try {
      await onConfirm(reason || 'Cancelled by user')
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel')
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleClose() {
    if (!isSubmitting) {
      setReason('')
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
        <div className="relative w-full max-w-sm transform overflow-hidden rounded-lg bg-white shadow-xl transition-all">
          <div className="px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Cancel Appointment?
            </h3>
            {appointmentInfo && (
              <p className="mt-1 text-sm text-gray-500">{appointmentInfo}</p>
            )}

            {error && (
              <div className="mt-3 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">
                {error}
              </div>
            )}

            <div className="mt-4">
              <label
                htmlFor="cancel-reason"
                className="block text-sm font-medium text-gray-700"
              >
                Reason (optional)
              </label>
              <input
                type="text"
                id="cancel-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={isSubmitting}
                placeholder="Why is this being cancelled?"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 disabled:bg-gray-100"
              />
            </div>
          </div>

          <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Keep Appointment
            </button>
            <button
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Cancelling...' : 'Yes, Cancel'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

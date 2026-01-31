'use client'

import { useState } from 'react'
import type { Appointment, AppointmentPriority } from '../types'
import { formatPriority, getPriorityColorClass, isHumanOverridden } from '../types'

// ============================================
// Priority Override Modal Component
// ============================================

interface PriorityOverrideModalProps {
  appointment: Appointment
  isOpen: boolean
  onClose: () => void
  onOverride: (newPriority: AppointmentPriority, justification: string) => Promise<void>
}

const PRIORITIES: AppointmentPriority[] = ['LOW', 'MEDIUM', 'HIGH']

const PRIORITY_DESCRIPTIONS: Record<AppointmentPriority, string> = {
  LOW: 'Standard scheduling, no urgency',
  MEDIUM: 'Elevated priority, schedule within 1-2 weeks',
  HIGH: 'Urgent, schedule as soon as possible',
}

export function PriorityOverrideModal({
  appointment,
  isOpen,
  onClose,
  onOverride,
}: PriorityOverrideModalProps) {
  const [selectedPriority, setSelectedPriority] = useState<AppointmentPriority>(
    appointment.priority
  )
  const [justification, setJustification] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const priorityHistory = appointment.priority_history || []
  const wasOverridden = isHumanOverridden(priorityHistory)
  const hasChanged = selectedPriority !== appointment.priority
  const isValidJustification = justification.trim().length >= 10

  async function handleSubmit() {
    if (!hasChanged) {
      setError('Please select a different priority')
      return
    }

    if (!isValidJustification) {
      setError('Justification must be at least 10 characters')
      return
    }

    setError(null)
    setIsSubmitting(true)

    try {
      await onOverride(selectedPriority, justification.trim())
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to override priority')
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleClose() {
    if (!isSubmitting) {
      setSelectedPriority(appointment.priority)
      setJustification('')
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
              Override Priority
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Manual priority changes require justification for audit trail.
            </p>
          </div>

          {/* Body */}
          <div className="px-6 py-4 space-y-4">
            {/* Error */}
            {error && (
              <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">
                {error}
              </div>
            )}

            {/* Previous Override Warning */}
            {wasOverridden && (
              <div className="text-sm text-amber-700 bg-amber-50 px-3 py-2 rounded-md border border-amber-200">
                This appointment&apos;s priority was previously overridden manually.
              </div>
            )}

            {/* Current Priority */}
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium">
                Current Priority
              </p>
              <span
                className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium ${getPriorityColorClass(
                  appointment.priority
                )}`}
              >
                {formatPriority(appointment.priority)}
              </span>
            </div>

            {/* Priority Selection */}
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium mb-2">
                New Priority
              </p>
              <div className="space-y-2">
                {PRIORITIES.map((priority) => (
                  <label
                    key={priority}
                    className={`flex items-start gap-3 p-3 rounded-md border cursor-pointer transition-colors ${
                      selectedPriority === priority
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="priority"
                      value={priority}
                      checked={selectedPriority === priority}
                      onChange={() => setSelectedPriority(priority)}
                      disabled={isSubmitting}
                      className="mt-1"
                    />
                    <div>
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColorClass(
                          priority
                        )}`}
                      >
                        {formatPriority(priority)}
                      </span>
                      <p className="text-sm text-gray-600 mt-1">
                        {PRIORITY_DESCRIPTIONS[priority]}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Justification */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Justification *
              </label>
              <textarea
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                rows={3}
                disabled={isSubmitting}
                placeholder="Explain why this priority change is necessary..."
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
              />
              <p className="mt-1 text-xs text-gray-500">
                {justification.length}/10 characters minimum
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !hasChanged || !isValidJustification}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : 'Confirm Override'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

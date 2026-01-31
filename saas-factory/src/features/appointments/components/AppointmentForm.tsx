'use client'

import { useState } from 'react'
import { requestAppointment } from '@/actions/appointments'
import type { Appointment } from '../types'

// ============================================
// Appointment Form Component
// ============================================

interface AppointmentFormProps {
  /** Pre-selected patient ID */
  patientId?: string
  /** Available patients for selection */
  patients?: { id: string; full_name: string }[]
  /** Callback on successful creation */
  onSuccess?: (result: { appointment?: Appointment; pending?: boolean; reason?: string }) => void
  /** Callback on cancel */
  onCancel?: () => void
}

const SPECIALTIES = [
  'General Medicine',
  'Cardiology',
  'Dermatology',
  'Orthopedics',
  'Pediatrics',
  'Neurology',
  'Psychiatry',
  'Ophthalmology',
  'ENT',
  'Other',
]

export function AppointmentForm({
  patientId,
  patients = [],
  onSuccess,
  onCancel,
}: AppointmentFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pendingInfo, setPendingInfo] = useState<{ pending: boolean; reason: string } | null>(null)

  // Get minimum date (tomorrow)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().slice(0, 16)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setPendingInfo(null)
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)

    try {
      const result = await requestAppointment(formData)

      if (result.ok) {
        if (result.pending) {
          setPendingInfo({
            pending: true,
            reason: result.reason,
          })
          onSuccess?.({ pending: true, reason: result.reason })
        } else {
          onSuccess?.({ appointment: result.data, pending: false })
        }
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('An unexpected error occurred')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (pendingInfo) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="text-lg font-medium text-yellow-800">Review Required</h3>
        <p className="mt-2 text-sm text-yellow-700">
          Your appointment request has been submitted for review.
        </p>
        <p className="mt-1 text-sm text-yellow-600">
          Reason: {pendingInfo.reason}
        </p>
        <p className="mt-4 text-sm text-yellow-700">
          You will be notified once your appointment is confirmed.
        </p>
        {onCancel && (
          <button
            onClick={onCancel}
            className="mt-4 px-4 py-2 text-sm font-medium text-yellow-800 bg-yellow-100 rounded-md hover:bg-yellow-200"
          >
            Close
          </button>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      {/* Patient Selection */}
      {!patientId && patients.length > 0 && (
        <div>
          <label htmlFor="patient_id" className="block text-sm font-medium text-gray-700">
            Patient *
          </label>
          <select
            id="patient_id"
            name="patient_id"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Select a patient</option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.full_name}
              </option>
            ))}
          </select>
        </div>
      )}

      {patientId && <input type="hidden" name="patient_id" value={patientId} />}

      {/* Scheduled Date/Time */}
      <div>
        <label htmlFor="scheduled_at" className="block text-sm font-medium text-gray-700">
          Date & Time *
        </label>
        <input
          type="datetime-local"
          id="scheduled_at"
          name="scheduled_at"
          required
          min={minDate}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Specialty */}
      <div>
        <label htmlFor="specialty" className="block text-sm font-medium text-gray-700">
          Specialty *
        </label>
        <select
          id="specialty"
          name="specialty"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Select a specialty</option>
          {SPECIALTIES.map((specialty) => (
            <option key={specialty} value={specialty}>
              {specialty}
            </option>
          ))}
        </select>
      </div>

      {/* Reason */}
      <div>
        <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
          Reason for Visit *
        </label>
        <textarea
          id="reason"
          name="reason"
          required
          minLength={5}
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Please describe the reason for your appointment..."
        />
        <p className="mt-1 text-xs text-gray-500">
          Be specific to help us prioritize your appointment appropriately.
        </p>
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          Additional Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={2}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Any additional information..."
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : 'Request Appointment'}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}

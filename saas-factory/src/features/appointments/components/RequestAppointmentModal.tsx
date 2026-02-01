'use client'

import { AppointmentForm } from './AppointmentForm'

// ============================================
// Request Appointment Modal Component
// ============================================

interface RequestAppointmentModalProps {
  isOpen: boolean
  onClose: () => void
  patients: { id: string; full_name: string }[]
  onSuccess?: () => void
}

export function RequestAppointmentModal({
  isOpen,
  onClose,
  patients,
  onSuccess,
}: RequestAppointmentModalProps) {
  if (!isOpen) return null

  function handleSuccess() {
    onSuccess?.()
    // Don't close immediately if pending - the form shows a message
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg transform overflow-hidden rounded-lg bg-white shadow-xl transition-all">
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Request Appointment
            </h3>
          </div>

          {/* Body */}
          <div className="px-6 py-4">
            <AppointmentForm
              patients={patients}
              onSuccess={handleSuccess}
              onCancel={onClose}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

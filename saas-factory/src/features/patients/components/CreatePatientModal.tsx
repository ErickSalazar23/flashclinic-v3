'use client'

import { PatientForm } from './PatientForm'
import type { Patient } from '../types'

// ============================================
// Create Patient Modal Component
// ============================================

interface CreatePatientModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (patient: Patient) => void
}

export function CreatePatientModal({ isOpen, onClose, onSuccess }: CreatePatientModalProps) {
  if (!isOpen) return null

  function handleSuccess(patient: Patient) {
    onSuccess?.(patient)
    onClose()
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
        <div className="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white shadow-xl transition-all">
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Add New Patient
            </h3>
          </div>

          {/* Body */}
          <div className="px-6 py-4">
            <PatientForm
              onSuccess={handleSuccess}
              onCancel={onClose}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

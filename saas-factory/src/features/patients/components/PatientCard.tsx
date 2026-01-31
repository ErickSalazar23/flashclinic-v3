'use client'

import type { Patient } from '../types'
import { formatPhone, calculateAge } from '../types'

// ============================================
// Patient Card Component
// ============================================

interface PatientCardProps {
  patient: Patient
  onEdit?: () => void
  onDelete?: () => void
}

export function PatientCard({ patient, onEdit, onDelete }: PatientCardProps) {
  const age = calculateAge(patient.birth_date)
  const isSenior = age >= 65

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{patient.full_name}</h3>
          <p className="text-sm text-gray-500">{patient.email}</p>
        </div>
        <div className="flex gap-2">
          {patient.is_recurring && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Recurring
            </span>
          )}
          {isSenior && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
              Senior (65+)
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-500">Phone:</span>
          <span className="ml-2 text-gray-900">{formatPhone(patient.phone)}</span>
        </div>
        <div>
          <span className="text-gray-500">Age:</span>
          <span className="ml-2 text-gray-900">{age} years</span>
        </div>
        <div>
          <span className="text-gray-500">Birth Date:</span>
          <span className="ml-2 text-gray-900">
            {new Date(patient.birth_date).toLocaleDateString()}
          </span>
        </div>
        <div>
          <span className="text-gray-500">Registered:</span>
          <span className="ml-2 text-gray-900">
            {new Date(patient.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>

      {(onEdit || onDelete) && (
        <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
          {onEdit && (
            <button
              onClick={onEdit}
              className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="flex-1 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  )
}

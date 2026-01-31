import { Suspense } from 'react'
import { listPatients } from '@/actions/patients'
import { PageLoading, EmptyState } from '@/shared/components'

// ============================================
// Patients List Page
// ============================================

async function PatientsList() {
  const result = await listPatients({})

  if (!result.ok) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <p className="text-sm text-red-700">Failed to load patients: {result.error}</p>
      </div>
    )
  }

  const patients = result.data

  if (patients.length === 0) {
    return (
      <EmptyState
        title="No patients yet"
        description="Start by adding your first patient to the system."
      />
    )
  }

  return (
    <div className="space-y-4">
      {patients.map((patient) => (
        <div
          key={patient.id}
          className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-lg font-semibold text-blue-600">
              {patient.full_name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{patient.full_name}</h3>
              <p className="text-sm text-gray-500">{patient.email}</p>
              {patient.phone && (
                <p className="text-sm text-gray-500">{patient.phone}</p>
              )}
            </div>
            <div className="text-right">
              {patient.is_recurring && (
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                  Recurring
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function PatientsPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Patients</h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage your patient records
          </p>
        </div>
      </div>

      {/* Patients list */}
      <Suspense fallback={<PageLoading message="Loading patients..." />}>
        <PatientsList />
      </Suspense>
    </div>
  )
}

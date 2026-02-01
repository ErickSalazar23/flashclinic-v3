import { Suspense } from 'react'
import { listPatients } from '@/actions/patients'
import { PageLoading } from '@/shared/components'
import { PatientsPageClient } from '@/features/patients/components'

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

  return <PatientsPageClient patients={result.data} />
}

export default function PatientsPage() {
  return (
    <div className="space-y-6">
      <Suspense fallback={<PageLoading message="Loading patients..." />}>
        <PatientsList />
      </Suspense>
    </div>
  )
}

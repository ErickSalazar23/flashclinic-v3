import { Suspense } from 'react'
import { listAppointments } from '@/actions/appointments'
import { listPatients } from '@/actions/patients'
import { PageLoading } from '@/shared/components'
import { AppointmentsPageClient } from '@/features/appointments/components'

// ============================================
// Appointments List Page
// ============================================

async function AppointmentsContent() {
  // Fetch appointments and patients in parallel
  const [appointmentsResult, patientsResult] = await Promise.all([
    listAppointments({}),
    listPatients({}),
  ])

  if (!appointmentsResult.ok) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <p className="text-sm text-red-700">Failed to load appointments: {appointmentsResult.error}</p>
      </div>
    )
  }

  // Extract patients for the dropdown (even if list fails, show empty array)
  const patients = patientsResult.ok
    ? patientsResult.data.map((p) => ({ id: p.id, full_name: p.full_name }))
    : []

  return (
    <AppointmentsPageClient
      appointments={appointmentsResult.data}
      patients={patients}
    />
  )
}

export default function AppointmentsPage() {
  return (
    <div className="space-y-6">
      <Suspense fallback={<PageLoading message="Loading appointments..." />}>
        <AppointmentsContent />
      </Suspense>
    </div>
  )
}

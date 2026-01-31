import { Suspense } from 'react'
import { listAppointments } from '@/actions/appointments'
import { PageLoading, EmptyState } from '@/shared/components'
import { AppointmentStatusBadge } from '@/features/appointments/components'

// ============================================
// Appointments List Page
// ============================================

async function AppointmentsList() {
  const result = await listAppointments({})

  if (!result.ok) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <p className="text-sm text-red-700">Failed to load appointments: {result.error}</p>
      </div>
    )
  }

  const appointments = result.data

  if (appointments.length === 0) {
    return (
      <EmptyState
        title="No appointments yet"
        description="Appointments will appear here once they are scheduled."
      />
    )
  }

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => (
        <div
          key={appointment.id}
          className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-gray-900">
                  {appointment.specialty}
                </h3>
                <AppointmentStatusBadge status={appointment.status} />
              </div>
              <p className="mt-1 text-sm text-gray-500">{appointment.reason}</p>
              <p className="mt-2 text-sm text-gray-600">
                Scheduled:{' '}
                {new Date(appointment.scheduled_at).toLocaleString('en-US', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  appointment.priority === 'HIGH'
                    ? 'bg-red-100 text-red-800'
                    : appointment.priority === 'MEDIUM'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                }`}
              >
                {appointment.priority}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function AppointmentsPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Appointments</h2>
          <p className="mt-1 text-sm text-gray-500">
            View and manage appointments
          </p>
        </div>
      </div>

      {/* Appointments list */}
      <Suspense fallback={<PageLoading message="Loading appointments..." />}>
        <AppointmentsList />
      </Suspense>
    </div>
  )
}

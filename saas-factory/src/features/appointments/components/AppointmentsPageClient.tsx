'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { Appointment } from '../types'
import { AppointmentStatusBadge } from './AppointmentStatusBadge'
import { RequestAppointmentModal } from './RequestAppointmentModal'

// ============================================
// Appointments Page Client Component
// ============================================

interface AppointmentsPageClientProps {
  appointments: Appointment[]
  patients: { id: string; full_name: string }[]
}

export function AppointmentsPageClient({ appointments, patients }: AppointmentsPageClientProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  function handleAppointmentCreated() {
    startTransition(() => {
      router.refresh()
    })
  }

  return (
    <>
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Appointments</h2>
          <p className="mt-1 text-sm text-gray-500">
            View and manage appointments
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          disabled={patients.length === 0}
          className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Request Appointment
        </button>
      </div>

      {/* No patients warning */}
      {patients.length === 0 && (
        <div className="rounded-md bg-yellow-50 p-4">
          <p className="text-sm text-yellow-700">
            You need to add patients before scheduling appointments.
          </p>
        </div>
      )}

      {/* Appointments list or empty state */}
      {appointments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="mt-4 text-sm font-medium text-gray-900">No appointments yet</h3>
          <p className="mt-1 text-sm text-gray-500">Appointments will appear here once scheduled.</p>
          {patients.length > 0 && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-4 inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Request Appointment
            </button>
          )}
        </div>
      ) : (
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
      )}

      {/* Request Appointment Modal */}
      <RequestAppointmentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        patients={patients}
        onSuccess={handleAppointmentCreated}
      />
    </>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { listAppointmentsWithPatients } from '@/actions/appointments'
import type { Appointment, AppointmentStatus, AppointmentPriority } from '../types'
import { formatStatus, formatPriority, getPriorityColorClass, getStatusColorClass } from '../types'

// ============================================
// Appointment List Component
// ============================================

type AppointmentWithPatient = Appointment & { patient: { full_name: string; email: string } }

interface AppointmentListProps {
  /** Initial appointments (from server) */
  initialAppointments?: AppointmentWithPatient[]
  /** Initial total count */
  initialTotal?: number
  /** Filter by patient ID */
  patientId?: string
  /** Callback when an appointment is selected */
  onSelect?: (appointment: AppointmentWithPatient) => void
  /** Callback for cancel action */
  onCancel?: (appointment: AppointmentWithPatient) => void
  /** Callback for complete action */
  onComplete?: (appointment: AppointmentWithPatient) => void
}

export function AppointmentList({
  initialAppointments = [],
  initialTotal = 0,
  patientId,
  onSelect,
  onCancel,
  onComplete,
}: AppointmentListProps) {
  const [appointments, setAppointments] = useState<AppointmentWithPatient[]>(initialAppointments)
  const [total, setTotal] = useState(initialTotal)
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | ''>('')
  const [priorityFilter, setPriorityFilter] = useState<AppointmentPriority | ''>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const limit = 10

  // Fetch appointments when filters change
  useEffect(() => {
    fetchAppointments()
  }, [statusFilter, priorityFilter, page, patientId])

  async function fetchAppointments() {
    setIsLoading(true)
    setError(null)

    const result = await listAppointmentsWithPatients({
      patient_id: patientId,
      status: statusFilter || undefined,
      priority: priorityFilter || undefined,
      limit,
      offset: page * limit,
    })

    if (result.ok) {
      setAppointments(result.data)
      setTotal(result.total)
    } else {
      setError(result.error)
    }

    setIsLoading(false)
  }

  const totalPages = Math.ceil(total / limit)

  function formatDateTime(dateStr: string) {
    const date = new Date(dateStr)
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4">
        <div>
          <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as AppointmentStatus | '')
              setPage(0)
            }}
            className="mt-1 block rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="REQUESTED">Requested</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="RESCHEDULED">Rescheduled</option>
            <option value="ATTENDED">Attended</option>
            <option value="NO_SHOW">No Show</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <div>
          <label htmlFor="priority-filter" className="block text-sm font-medium text-gray-700">
            Priority
          </label>
          <select
            id="priority-filter"
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value as AppointmentPriority | '')
              setPage(0)
            }}
            className="mt-1 block rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="text-center py-4 text-gray-500">Loading...</div>
      )}

      {/* Empty state */}
      {!isLoading && appointments.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No appointments found
        </div>
      )}

      {/* Appointments list */}
      {!isLoading && appointments.length > 0 && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Specialty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                {(onCancel || onComplete) && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {appointments.map((appointment) => (
                <tr
                  key={appointment.id}
                  onClick={() => onSelect?.(appointment)}
                  className={onSelect ? 'cursor-pointer hover:bg-gray-50' : ''}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {appointment.patient.full_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {appointment.patient.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDateTime(appointment.scheduled_at)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {appointment.specialty}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColorClass(
                        appointment.status
                      )}`}
                    >
                      {formatStatus(appointment.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColorClass(
                        appointment.priority
                      )}`}
                    >
                      {formatPriority(appointment.priority)}
                    </span>
                  </td>
                  {(onCancel || onComplete) && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {appointment.status === 'CONFIRMED' && (
                        <>
                          {onComplete && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                onComplete(appointment)
                              }}
                              className="text-green-600 hover:text-green-900 mr-3"
                            >
                              Complete
                            </button>
                          )}
                          {onCancel && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                onCancel(appointment)
                              }}
                              className="text-red-600 hover:text-red-900"
                            >
                              Cancel
                            </button>
                          )}
                        </>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {page * limit + 1} to {Math.min((page + 1) * limit, total)} of{' '}
            {total} appointments
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 0}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages - 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

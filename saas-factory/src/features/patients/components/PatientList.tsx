'use client'

import { useState, useEffect } from 'react'
import { listPatients } from '@/actions/patients'
import type { Patient } from '../types'
import { formatPhone, calculateAge } from '../types'

// ============================================
// Patient List Component
// ============================================

interface PatientListProps {
  /** Initial patients (from server) */
  initialPatients?: Patient[]
  /** Initial total count */
  initialTotal?: number
  /** Callback when a patient is selected */
  onSelect?: (patient: Patient) => void
  /** Callback for edit action */
  onEdit?: (patient: Patient) => void
  /** Callback for delete action */
  onDelete?: (patient: Patient) => void
}

export function PatientList({
  initialPatients = [],
  initialTotal = 0,
  onSelect,
  onEdit,
  onDelete,
}: PatientListProps) {
  const [patients, setPatients] = useState<Patient[]>(initialPatients)
  const [total, setTotal] = useState(initialTotal)
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const limit = 10

  // Fetch patients when search or page changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchPatients()
    }, 300) // Debounce search

    return () => clearTimeout(timeoutId)
  }, [search, page])

  async function fetchPatients() {
    setIsLoading(true)
    setError(null)

    const result = await listPatients({
      search: search || undefined,
      limit,
      offset: page * limit,
    })

    if (result.ok) {
      setPatients(result.data)
      setTotal(result.total)
    } else {
      setError(result.error)
    }

    setIsLoading(false)
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-4">
      {/* Search */}
      <div>
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(0) // Reset to first page on search
          }}
          className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
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
      {!isLoading && patients.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {search ? 'No patients found matching your search' : 'No patients yet'}
        </div>
      )}

      {/* Patient list */}
      {!isLoading && patients.length > 0 && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Age
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                {(onEdit || onDelete) && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {patients.map((patient) => (
                <tr
                  key={patient.id}
                  onClick={() => onSelect?.(patient)}
                  className={onSelect ? 'cursor-pointer hover:bg-gray-50' : ''}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {patient.full_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{patient.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {formatPhone(patient.phone)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {calculateAge(patient.birth_date)} years
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {patient.is_recurring ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Recurring
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        New
                      </span>
                    )}
                  </td>
                  {(onEdit || onDelete) && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {onEdit && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onEdit(patient)
                          }}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Edit
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onDelete(patient)
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
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
            {total} patients
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

'use client'

import { useState, useEffect } from 'react'
import { listDecisionsWithPatients, type ListDecisionsFilters } from '@/actions/decisions'
import type { PendingDecision, DecisionWeight } from '../types'
import { PendingDecisionCard } from './PendingDecisionCard'

// ============================================
// Decision List Component
// ============================================

type DecisionWithPatient = PendingDecision & {
  patient?: { full_name: string; email: string }
}

interface DecisionListProps {
  /** Initial decisions (from server) */
  initialDecisions?: DecisionWithPatient[]
  /** Initial total count */
  initialTotal?: number
  /** Default status filter */
  defaultStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL'
  /** Callback when approve is clicked */
  onApprove?: (decision: DecisionWithPatient) => void
  /** Callback when reject is clicked */
  onReject?: (decision: DecisionWithPatient) => void
}

export function DecisionList({
  initialDecisions = [],
  initialTotal = 0,
  defaultStatus = 'PENDING',
  onApprove,
  onReject,
}: DecisionListProps) {
  const [decisions, setDecisions] = useState<DecisionWithPatient[]>(initialDecisions)
  const [total, setTotal] = useState(initialTotal)
  const [statusFilter, setStatusFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL'>(defaultStatus)
  const [weightFilter, setWeightFilter] = useState<DecisionWeight | ''>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const limit = 10

  useEffect(() => {
    fetchDecisions()
  }, [statusFilter, weightFilter, page])

  async function fetchDecisions() {
    setIsLoading(true)
    setError(null)

    const filters: ListDecisionsFilters = {
      status: statusFilter,
      weight: weightFilter || undefined,
      limit,
      offset: page * limit,
    }

    const result = await listDecisionsWithPatients(filters)

    if (result.ok) {
      setDecisions(result.data)
      setTotal(result.total)
    } else {
      setError(result.error)
    }

    setIsLoading(false)
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div>
          <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as 'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL')
              setPage(0)
            }}
            className="mt-1 block rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="ALL">All</option>
          </select>
        </div>

        <div>
          <label htmlFor="weight-filter" className="block text-sm font-medium text-gray-700">
            Priority
          </label>
          <select
            id="weight-filter"
            value={weightFilter}
            onChange={(e) => {
              setWeightFilter(e.target.value as DecisionWeight | '')
              setPage(0)
            }}
            className="mt-1 block rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Priorities</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
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
      {!isLoading && decisions.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No decisions found
        </div>
      )}

      {/* Decision cards */}
      {!isLoading && decisions.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {decisions.map((decision) => (
            <PendingDecisionCard
              key={decision.id}
              decision={decision}
              onApprove={onApprove ? () => onApprove(decision) : undefined}
              onReject={onReject ? () => onReject(decision) : undefined}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {page * limit + 1} to {Math.min((page + 1) * limit, total)} of{' '}
            {total} decisions
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

// ============================================
// Decision Stats Component
// ============================================

interface DecisionStatsProps {
  counts: {
    total: number
    high: number
    medium: number
    low: number
  }
}

export function DecisionStats({ counts }: DecisionStatsProps) {
  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="bg-white rounded-lg shadow p-4">
        <p className="text-2xl font-bold text-gray-900">{counts.total}</p>
        <p className="text-sm text-gray-500">Total Pending</p>
      </div>
      <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
        <p className="text-2xl font-bold text-red-600">{counts.high}</p>
        <p className="text-sm text-gray-500">High Priority</p>
      </div>
      <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
        <p className="text-2xl font-bold text-yellow-600">{counts.medium}</p>
        <p className="text-sm text-gray-500">Medium Priority</p>
      </div>
      <div className="bg-white rounded-lg shadow p-4 border-l-4 border-gray-400">
        <p className="text-2xl font-bold text-gray-600">{counts.low}</p>
        <p className="text-sm text-gray-500">Low Priority</p>
      </div>
    </div>
  )
}

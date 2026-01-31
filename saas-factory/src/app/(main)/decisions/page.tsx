import { Suspense } from 'react'
import { listDecisions } from '@/actions/decisions'
import { PageLoading, EmptyState } from '@/shared/components'

// ============================================
// Decisions List Page
// ============================================

async function DecisionsList() {
  const result = await listDecisions({ status: 'PENDING' })

  if (!result.ok) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <p className="text-sm text-red-700">Failed to load decisions: {result.error}</p>
      </div>
    )
  }

  const decisions = result.data

  if (decisions.length === 0) {
    return (
      <EmptyState
        title="No pending decisions"
        description="All decisions have been processed. New decisions will appear here when they require review."
      />
    )
  }

  return (
    <div className="space-y-4">
      {decisions.map((decision) => (
        <div
          key={decision.id}
          className={`rounded-lg border-l-4 bg-white p-4 shadow ${
            decision.weight === 'HIGH'
              ? 'border-red-500'
              : decision.weight === 'MEDIUM'
                ? 'border-yellow-500'
                : 'border-gray-300'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    decision.autonomy_level === 'BLOCKED'
                      ? 'bg-red-100 text-red-800'
                      : decision.autonomy_level === 'SUPERVISED'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                  }`}
                >
                  {decision.autonomy_level}
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    decision.weight === 'HIGH'
                      ? 'bg-red-100 text-red-800'
                      : decision.weight === 'MEDIUM'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {decision.weight} Priority
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-900">{decision.reason}</p>
              <p className="mt-1 text-xs text-gray-500">
                Created: {new Date(decision.created_at).toLocaleString()}
              </p>
            </div>
            <div className="ml-4 flex gap-2">
              <form>
                <button
                  type="submit"
                  className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700"
                >
                  Approve
                </button>
              </form>
              <form>
                <button
                  type="submit"
                  className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
                >
                  Reject
                </button>
              </form>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function DecisionsPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Pending Decisions</h2>
          <p className="mt-1 text-sm text-gray-500">
            Review and process decisions that require human judgment
          </p>
        </div>
      </div>

      {/* Decisions list */}
      <Suspense fallback={<PageLoading message="Loading decisions..." />}>
        <DecisionsList />
      </Suspense>
    </div>
  )
}

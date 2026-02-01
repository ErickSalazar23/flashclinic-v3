import { Suspense } from 'react'
import { listDecisions } from '@/actions/decisions'
import { PageLoading, EmptyState } from '@/shared/components'
import { DecisionsPageClient } from '@/features/decisions/components'

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

  return <DecisionsPageClient decisions={decisions} />
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

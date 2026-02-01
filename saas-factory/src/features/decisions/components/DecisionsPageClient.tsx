'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { PendingDecision } from '../types'
import { PendingDecisionCard } from './PendingDecisionCard'
import { ApprovalModal } from './ApprovalModal'
import { approveDecision, rejectDecision } from '@/actions/decisions'

// ============================================
// Decisions Page Client Component
// ============================================

interface DecisionsPageClientProps {
  decisions: PendingDecision[]
}

export function DecisionsPageClient({ decisions }: DecisionsPageClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [selectedDecision, setSelectedDecision] = useState<PendingDecision | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleApprove(notes?: string) {
    if (!selectedDecision) return

    const result = await approveDecision(selectedDecision.id, notes)

    if (!result.ok) {
      throw new Error(result.error)
    }

    setSelectedDecision(null)
    startTransition(() => {
      router.refresh()
    })
  }

  async function handleReject(reason: string) {
    if (!selectedDecision) return

    const result = await rejectDecision(selectedDecision.id, reason)

    if (!result.ok) {
      throw new Error(result.error)
    }

    setSelectedDecision(null)
    startTransition(() => {
      router.refresh()
    })
  }

  function handleQuickApprove(decision: PendingDecision) {
    setSelectedDecision(decision)
  }

  function handleQuickReject(decision: PendingDecision) {
    setSelectedDecision(decision)
  }

  if (decisions.length === 0) {
    return null
  }

  return (
    <>
      {/* Error message */}
      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-sm font-medium text-red-600 hover:text-red-500"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Decisions list */}
      <div className="space-y-4">
        {decisions.map((decision) => (
          <PendingDecisionCard
            key={decision.id}
            decision={decision}
            onApprove={() => handleQuickApprove(decision)}
            onReject={() => handleQuickReject(decision)}
            isLoading={isPending}
          />
        ))}
      </div>

      {/* Approval Modal */}
      {selectedDecision && (
        <ApprovalModal
          decision={selectedDecision}
          isOpen={true}
          onClose={() => setSelectedDecision(null)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </>
  )
}

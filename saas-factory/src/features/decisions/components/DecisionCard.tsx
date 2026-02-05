'use client'

import { Decision, DECISION_TYPE_LABELS, DECISION_PRIORITY_LABELS } from '../types'
import { updateDecisionStatus } from '@/actions/decisions'
import { useTransition } from 'react'

interface DecisionCardProps {
  decision: Decision
  onUpdate?: () => void
}

export function DecisionCard({ decision, onUpdate }: DecisionCardProps) {
  const [isPending, startTransition] = useTransition()

  const handleApprove = () => {
    startTransition(async () => {
      await updateDecisionStatus(decision.id, 'APPROVED')
      onUpdate?.()
    })
  }

  const handleReject = () => {
    startTransition(async () => {
      await updateDecisionStatus(decision.id, 'REJECTED')
      onUpdate?.()
    })
  }

  const handleDefer = () => {
    startTransition(async () => {
      await updateDecisionStatus(decision.id, 'DEFERRED')
      onUpdate?.()
    })
  }

  const priorityColors = {
    high: 'border-l-red-500',
    medium: 'border-l-yellow-500',
    low: 'border-l-blue-500'
  }

  return (
    <div className={`card border-l-4 ${priorityColors[decision.priority]} ${isPending ? 'opacity-50' : ''}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="badge bg-slate-700 text-slate-300">
              {DECISION_TYPE_LABELS[decision.type]}
            </span>
            <span className={`badge ${
              decision.priority === 'high' ? 'badge-critical' :
              decision.priority === 'medium' ? 'badge-moderate' : 'badge-stable'
            }`}>
              {DECISION_PRIORITY_LABELS[decision.priority]}
            </span>
          </div>

          <h3 className="text-lg font-semibold text-white mb-1 truncate">
            {decision.title}
          </h3>

          <p className="text-slate-400 text-sm mb-3 line-clamp-2">
            {decision.description}
          </p>

          {decision.prospectName && (
            <p className="text-sm text-slate-500">
              Prospecto: <span className="text-slate-300">{decision.prospectName}</span>
            </p>
          )}

          {decision.dueDate && (
            <p className="text-sm text-slate-500 mt-1">
              Vence: <span className="text-slate-300">
                {new Date(decision.dueDate).toLocaleDateString('es-ES')}
              </span>
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-700">
        <button
          onClick={handleApprove}
          disabled={isPending}
          className="btn btn-primary flex-1"
        >
          Aprobar
        </button>
        <button
          onClick={handleReject}
          disabled={isPending}
          className="btn btn-danger flex-1"
        >
          Rechazar
        </button>
        <button
          onClick={handleDefer}
          disabled={isPending}
          className="btn btn-ghost"
        >
          Diferir
        </button>
      </div>
    </div>
  )
}

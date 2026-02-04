'use client'

import { Brain, Target } from 'lucide-react'
import type { ReactNode } from 'react'

// ============================================
// Insight Card Component - AI Recommendations
// ============================================

interface InsightProps {
  type: 'warning' | 'tip' | 'info'
  children: ReactNode
}

function Insight({ type, children }: InsightProps) {
  const colorClasses = {
    warning: 'bg-flash-500/5 border-flash-500/20',
    tip: 'bg-blue-500/5 border-blue-500/20',
    info: 'bg-green-500/5 border-green-500/20',
  }

  return (
    <div className={`p-4 border rounded-xl ${colorClasses[type]}`}>
      <p className="text-sm text-surface-300 leading-relaxed">{children}</p>
    </div>
  )
}

interface InsightCardProps {
  insights: Array<{
    id: string | number
    type: 'warning' | 'tip' | 'info'
    content: ReactNode
  }>
  onViewReport?: () => void
}

export function InsightCard({ insights, onViewReport }: InsightCardProps) {
  return (
    <div className="bg-gradient-to-b from-surface-900 to-surface-950 border border-surface-800 rounded-3xl p-6">
      <div className="flex items-center gap-2 mb-6 text-flash-500">
        <Brain className="w-5 h-5" />
        <h3 className="font-bold uppercase tracking-wider text-xs">
          Agencia Flash: Recomendación
        </h3>
      </div>
      <div className="space-y-4">
        {insights.map((insight) => (
          <Insight key={insight.id} type={insight.type}>
            {insight.content}
          </Insight>
        ))}
      </div>
      {onViewReport && (
        <button
          onClick={onViewReport}
          className="w-full mt-6 py-3 bg-surface-800 hover:bg-surface-700 rounded-xl text-xs font-bold text-surface-300 border border-surface-700 transition-all"
        >
          VER INFORME COMPLETO
        </button>
      )}
    </div>
  )
}

interface GoalCardProps {
  title: string
  progress: number // 0-100
}

export function GoalCard({ title, progress }: GoalCardProps) {
  return (
    <div className="bg-surface-900/30 border border-dashed border-surface-800 rounded-3xl p-6">
      <h4 className="text-surface-500 font-bold text-[10px] uppercase mb-4 tracking-[0.2em]">
        Siguiente hito
      </h4>
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-surface-800 flex items-center justify-center border border-surface-700">
          <Target className="w-5 h-5 text-surface-500" />
        </div>
        <div>
          <div className="text-sm font-bold text-white">{title}</div>
          <div className="w-32 h-1.5 bg-surface-800 rounded-full mt-1 overflow-hidden">
            <div
              className="h-full bg-flash-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

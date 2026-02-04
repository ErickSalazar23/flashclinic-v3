'use client'

import { HeartPulse } from 'lucide-react'

// ============================================
// Health Score Component
// ============================================

interface HealthScoreProps {
  score: number
  label?: string
  sublabel?: string
}

export function HealthScore({
  score,
  label = 'Salud Operativa',
  sublabel = 'Actualizado hace 2 min',
}: HealthScoreProps) {
  // Calculate circle properties
  const radius = 28
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (circumference * score) / 100

  // Determine color based on score
  const getScoreColor = () => {
    if (score >= 80) return 'text-green-500'
    if (score >= 60) return 'text-flash-500'
    return 'text-red-500'
  }

  const getStatusText = () => {
    if (score >= 80) return 'Excelente ejecución'
    if (score >= 60) return 'Atención requerida'
    return 'Riesgo de fugas detectado'
  }

  return (
    <div className="bg-surface-900/50 border border-surface-800 rounded-2xl p-4 flex items-center gap-6 backdrop-blur-xl">
      {/* Circular Progress */}
      <div className="relative flex items-center justify-center">
        <svg className="w-16 h-16 transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="32"
            cy="32"
            r={radius}
            stroke="currentColor"
            strokeWidth="4"
            fill="transparent"
            className="text-surface-800"
          />
          {/* Progress circle */}
          <circle
            cx="32"
            cy="32"
            r={radius}
            stroke="currentColor"
            strokeWidth="4"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`${getScoreColor()} transition-all duration-1000`}
          />
        </svg>
        <span className="absolute text-lg font-black text-white">{score}%</span>
      </div>

      {/* Labels */}
      <div>
        <div className="flex items-center gap-2">
          <HeartPulse className="w-4 h-4 text-flash-500" />
          <span className="text-xs font-bold uppercase tracking-wider text-surface-400">
            {label}
          </span>
        </div>
        <div className="text-sm font-semibold text-white">{getStatusText()}</div>
        <div className="text-[10px] text-surface-500">{sublabel}</div>
      </div>
    </div>
  )
}

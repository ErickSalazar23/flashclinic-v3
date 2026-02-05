'use client'

import { Prospect, StageType } from '@/features/medical/types'
import { updateProspectStage } from '@/actions/prospects'
import { useTransition } from 'react'

interface ProspectCardProps {
  prospect: Prospect
  onUpdate?: () => void
  onSelect?: (prospect: Prospect) => void
}

const STAGE_LABELS: Record<StageType, string> = {
  agenda_detenida: 'Agenda Detenida',
  diagnostico_proceso: 'En Diagnóstico',
  tratamiento_aplicado: 'En Tratamiento',
  recuperacion_exitosa: 'Recuperado'
}

const SEVERITY_COLORS = {
  critical: 'border-l-red-500 bg-red-500/5',
  severe: 'border-l-orange-500 bg-orange-500/5',
  moderate: 'border-l-yellow-500 bg-yellow-500/5',
  stable: 'border-l-green-500 bg-green-500/5'
}

const SEVERITY_BADGES = {
  critical: 'badge-critical',
  severe: 'badge-severe',
  moderate: 'badge-moderate',
  stable: 'badge-stable'
}

export function ProspectCard({ prospect, onUpdate, onSelect }: ProspectCardProps) {
  const [isPending, startTransition] = useTransition()

  const severity = prospect.diagnostic?.severity || 'stable'
  const perdidaAnual = prospect.diagnostic?.perdidaAnual || 0

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const handleStageChange = (newStage: StageType) => {
    startTransition(async () => {
      await updateProspectStage(prospect.id, newStage)
      onUpdate?.()
    })
  }

  const nextStage = (): StageType | null => {
    switch (prospect.stage) {
      case 'agenda_detenida': return 'diagnostico_proceso'
      case 'diagnostico_proceso': return 'tratamiento_aplicado'
      case 'tratamiento_aplicado': return 'recuperacion_exitosa'
      default: return null
    }
  }

  const next = nextStage()

  return (
    <div
      className={`card border-l-4 cursor-pointer transition-all hover:scale-[1.02] ${SEVERITY_COLORS[severity]} ${isPending ? 'opacity-50' : ''}`}
      onClick={() => onSelect?.(prospect)}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate">{prospect.doctorName}</h3>
          <p className="text-sm text-slate-400 truncate">{prospect.clinicName}</p>
        </div>
        <span className={`badge ${SEVERITY_BADGES[severity]}`}>
          {severity}
        </span>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-500">Especialidad</span>
          <span className="text-slate-300">{prospect.specialty}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Ciudad</span>
          <span className="text-slate-300">{prospect.city}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Hemorragia Anual</span>
          <span className="text-red-400 font-medium">{formatCurrency(perdidaAnual)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Deal Value</span>
          <span className="text-green-400 font-medium">{formatCurrency(prospect.dealValue)}</span>
        </div>
      </div>

      {next && (
        <div className="mt-4 pt-4 border-t border-slate-700">
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleStageChange(next)
            }}
            disabled={isPending}
            className="btn btn-primary w-full text-sm"
          >
            Mover a {STAGE_LABELS[next]}
          </button>
        </div>
      )}
    </div>
  )
}

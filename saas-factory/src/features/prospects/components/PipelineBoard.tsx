'use client'

import { Prospect, StageType } from '@/features/medical/types'
import { ProspectCard } from './ProspectCard'
import { useRouter } from 'next/navigation'

interface PipelineBoardProps {
  prospects: Prospect[]
}

interface PipelineColumn {
  stage: StageType
  title: string
  color: string
  bgColor: string
}

const COLUMNS: PipelineColumn[] = [
  {
    stage: 'agenda_detenida',
    title: 'Agenda Detenida',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10'
  },
  {
    stage: 'diagnostico_proceso',
    title: 'En Diagnóstico',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10'
  },
  {
    stage: 'tratamiento_aplicado',
    title: 'En Tratamiento',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10'
  },
  {
    stage: 'recuperacion_exitosa',
    title: 'Recuperados',
    color: 'text-green-400',
    bgColor: 'bg-green-500/10'
  }
]

export function PipelineBoard({ prospects }: PipelineBoardProps) {
  const router = useRouter()

  const handleUpdate = () => {
    router.refresh()
  }

  const handleSelect = (prospect: Prospect) => {
    // Could navigate to detail page or open modal
    console.log('Selected prospect:', prospect.id)
  }

  const getProspectsForStage = (stage: StageType) => {
    return prospects.filter(p => p.stage === stage)
  }

  const getTotalValue = (stageProspects: Prospect[]) => {
    return stageProspects.reduce((sum, p) => sum + p.dealValue, 0)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {COLUMNS.map(column => {
        const stageProspects = getProspectsForStage(column.stage)
        const totalValue = getTotalValue(stageProspects)

        return (
          <div key={column.stage} className="flex flex-col">
            {/* Column Header */}
            <div className={`rounded-t-xl p-4 ${column.bgColor}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className={`font-semibold ${column.color}`}>{column.title}</h3>
                <span className={`text-sm font-medium ${column.color}`}>
                  {stageProspects.length}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Valor: {formatCurrency(totalValue)}
              </p>
            </div>

            {/* Column Content */}
            <div className="flex-1 bg-slate-800/30 rounded-b-xl p-3 space-y-3 min-h-[400px]">
              {stageProspects.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-slate-500 text-sm">
                  Sin prospectos
                </div>
              ) : (
                stageProspects.map(prospect => (
                  <ProspectCard
                    key={prospect.id}
                    prospect={prospect}
                    onUpdate={handleUpdate}
                    onSelect={handleSelect}
                  />
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

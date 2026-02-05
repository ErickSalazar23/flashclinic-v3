'use client'

import { DashboardMetrics, PipelineMetrics } from '@/actions/dashboard'
import { KpiCard } from '@/features/medical/components/KpiCard'

interface DashboardClientProps {
  metrics: DashboardMetrics
  pipeline: PipelineMetrics
}

export function DashboardClient({ metrics, pipeline }: DashboardClientProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const totalPipeline = pipeline.agendaDetenida + pipeline.diagnosticoProceso +
    pipeline.tratamientoAplicado + pipeline.recuperacionExitosa

  return (
    <div className="space-y-8">
      {/* KPI Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Prospectos Totales"
          value={metrics.totalProspects.toString()}
          change={metrics.prospectsChange}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
          color="blue"
        />

        <KpiCard
          title="Decisiones Pendientes"
          value={metrics.pendingDecisions.toString()}
          change={metrics.decisionsChange}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          }
          color="orange"
        />

        <KpiCard
          title="Hemorragia Total"
          value={formatCurrency(metrics.totalRevenueLost)}
          change={metrics.revenueChange}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="red"
        />

        <KpiCard
          title="Tasa Conversión"
          value={`${metrics.conversionRate.toFixed(1)}%`}
          change={metrics.conversionChange}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
          color="green"
        />
      </div>

      {/* Pipeline Overview */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-6">Pipeline de Tratamiento</h3>

        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-500/20 flex items-center justify-center mb-2">
              <span className="text-2xl font-bold text-red-400">{pipeline.agendaDetenida}</span>
            </div>
            <p className="text-sm text-slate-400">Agenda Detenida</p>
            <p className="text-xs text-slate-500 mt-1">
              {totalPipeline > 0 ? ((pipeline.agendaDetenida / totalPipeline) * 100).toFixed(0) : 0}%
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-orange-500/20 flex items-center justify-center mb-2">
              <span className="text-2xl font-bold text-orange-400">{pipeline.diagnosticoProceso}</span>
            </div>
            <p className="text-sm text-slate-400">En Diagnóstico</p>
            <p className="text-xs text-slate-500 mt-1">
              {totalPipeline > 0 ? ((pipeline.diagnosticoProceso / totalPipeline) * 100).toFixed(0) : 0}%
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-blue-500/20 flex items-center justify-center mb-2">
              <span className="text-2xl font-bold text-blue-400">{pipeline.tratamientoAplicado}</span>
            </div>
            <p className="text-sm text-slate-400">En Tratamiento</p>
            <p className="text-xs text-slate-500 mt-1">
              {totalPipeline > 0 ? ((pipeline.tratamientoAplicado / totalPipeline) * 100).toFixed(0) : 0}%
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center mb-2">
              <span className="text-2xl font-bold text-green-400">{pipeline.recuperacionExitosa}</span>
            </div>
            <p className="text-sm text-slate-400">Recuperados</p>
            <p className="text-xs text-slate-500 mt-1">
              {totalPipeline > 0 ? ((pipeline.recuperacionExitosa / totalPipeline) * 100).toFixed(0) : 0}%
            </p>
          </div>
        </div>

        {/* Pipeline Bar */}
        <div className="mt-6 h-3 bg-slate-700 rounded-full overflow-hidden flex">
          {totalPipeline > 0 && (
            <>
              <div
                className="bg-red-500 h-full"
                style={{ width: `${(pipeline.agendaDetenida / totalPipeline) * 100}%` }}
              />
              <div
                className="bg-orange-500 h-full"
                style={{ width: `${(pipeline.diagnosticoProceso / totalPipeline) * 100}%` }}
              />
              <div
                className="bg-blue-500 h-full"
                style={{ width: `${(pipeline.tratamientoAplicado / totalPipeline) * 100}%` }}
              />
              <div
                className="bg-green-500 h-full"
                style={{ width: `${(pipeline.recuperacionExitosa / totalPipeline) * 100}%` }}
              />
            </>
          )}
        </div>
      </div>

      {/* Severity Distribution */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-6">Distribución de Severidad</h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
            <div className="text-3xl font-bold text-red-400">{metrics.criticalCases}</div>
            <div className="text-sm text-red-300">Críticos</div>
          </div>

          <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
            <div className="text-3xl font-bold text-orange-400">{metrics.severeCases}</div>
            <div className="text-sm text-orange-300">Severos</div>
          </div>

          <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <div className="text-3xl font-bold text-yellow-400">{metrics.moderateCases}</div>
            <div className="text-sm text-yellow-300">Moderados</div>
          </div>

          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
            <div className="text-3xl font-bold text-green-400">{metrics.stableCases}</div>
            <div className="text-sm text-green-300">Estables</div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Resumen Financiero</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Hemorragia Total Detectada</span>
              <span className="text-white font-medium">{formatCurrency(metrics.totalRevenueLost)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Promedio por Prospecto</span>
              <span className="text-white font-medium">{formatCurrency(metrics.averageRevenueLost)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Prospectos Analizados</span>
              <span className="text-white font-medium">{metrics.totalProspects}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Actividad Reciente</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Prospectos este mes</span>
              <span className="text-white font-medium">{metrics.prospectsThisMonth}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Decisiones pendientes</span>
              <span className="text-white font-medium">{metrics.pendingDecisions}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Tasa de conversión</span>
              <span className="text-white font-medium">{metrics.conversionRate.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

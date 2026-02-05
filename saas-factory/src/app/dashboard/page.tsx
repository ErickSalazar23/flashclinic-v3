import { Suspense } from 'react'
import { getDashboardMetrics, getPipelineMetrics } from '@/actions/dashboard'
import { DashboardClient } from '@/features/dashboard/components'
import { PageLoading } from '@/shared/components'

export const dynamic = 'force-dynamic'

async function DashboardContent() {
  const [metricsResult, pipelineResult] = await Promise.all([
    getDashboardMetrics(),
    getPipelineMetrics()
  ])

  if (!metricsResult.ok || !pipelineResult.ok) {
    return (
      <div className="rounded-md bg-red-500/10 border border-red-500/20 p-4">
        <p className="text-sm text-red-400">
          Error al cargar el dashboard: {!metricsResult.ok ? metricsResult.error : pipelineResult.error}
        </p>
      </div>
    )
  }

  return (
    <DashboardClient
      metrics={metricsResult.data}
      pipeline={pipelineResult.data}
    />
  )
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Dashboard</h2>
          <p className="mt-1 text-sm text-slate-400">
            Vista general del sistema Flash Clinic
          </p>
        </div>
      </div>

      {/* Dashboard content */}
      <Suspense fallback={<PageLoading message="Cargando dashboard..." />}>
        <DashboardContent />
      </Suspense>
    </div>
  )
}

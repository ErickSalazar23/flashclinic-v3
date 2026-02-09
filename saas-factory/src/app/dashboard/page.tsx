import { getAppointmentsMetrics } from '@/actions/appointments-metrics'
import { OperationalDashboard } from '@/features/dashboard/components/OperationalDashboard'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const metricsResult = await getAppointmentsMetrics()

  if (metricsResult.ok === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#0a1628] to-slate-950 text-white p-6 flex items-center justify-center">
        <div className="max-w-md text-center">
          <h1 className="text-3xl font-bold text-red-400 mb-4">Error</h1>
          <p className="text-slate-300">{metricsResult.error}</p>
        </div>
      </div>
    )
  }

  return <OperationalDashboard metrics={metricsResult.data} />
}

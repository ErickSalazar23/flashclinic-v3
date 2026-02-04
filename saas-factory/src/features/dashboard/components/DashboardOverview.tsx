import { createClient } from '@/lib/supabase/server'
import { StatsCard } from './StatsCard'
import { HealthScore } from './HealthScore'
import { InsightCard, GoalCard } from './InsightCard'
import { ActionCard } from './ActionCard'
import {
  Target,
  ShieldAlert,
  Zap,
  Activity,
  Users,
  CalendarDays,
  AlertCircle,
} from 'lucide-react'
import Link from 'next/link'

// ============================================
// Dashboard Overview Component
// ============================================

async function getStats() {
  const supabase = await createClient()

  // Fetch counts in parallel
  const [patientsResult, appointmentsResult, pendingDecisionsResult, todayAppointmentsResult] =
    await Promise.all([
      supabase.from('patients').select('id', { count: 'exact', head: true }),
      supabase.from('appointments').select('id', { count: 'exact', head: true }),
      supabase
        .from('pending_decisions')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'PENDING'),
      supabase
        .from('appointments')
        .select('id', { count: 'exact', head: true })
        .gte('scheduled_at', new Date().toISOString().split('T')[0])
        .lt(
          'scheduled_at',
          new Date(Date.now() + 86400000).toISOString().split('T')[0]
        ),
    ])

  return {
    totalPatients: patientsResult.count ?? 0,
    totalAppointments: appointmentsResult.count ?? 0,
    pendingDecisions: pendingDecisionsResult.count ?? 0,
    todayAppointments: todayAppointmentsResult.count ?? 0,
  }
}

// Calculate health score based on pending actions
function calculateHealthScore(pendingDecisions: number, todayAppointments: number): number {
  // Simple formula: start at 100, subtract for pending items
  const base = 100
  const pendingPenalty = pendingDecisions * 5
  const appointmentFactor = todayAppointments > 0 ? 0 : 10 // Penalty if no appointments
  return Math.max(0, Math.min(100, base - pendingPenalty - appointmentFactor))
}

// Sample pending actions for demo
const sampleActions = [
  {
    id: '1',
    tipo: 'confirmacion' as const,
    paciente: 'María García',
    descripcion: 'Hola María, confirmamos tu cita hoy a las 10:00. ¿Puedes asistir?',
    prioridad: 'alta' as const,
    fecha: 'Hoy',
    hora: '10:00 AM',
  },
  {
    id: '2',
    tipo: 'reprogramar' as const,
    paciente: 'Carlos López',
    descripcion: 'Carlos, tu cita de mañana fue cancelada. ¿Podemos reagendarla?',
    prioridad: 'alta' as const,
    fecha: 'Mañana',
    hora: '3:00 PM',
  },
  {
    id: '3',
    tipo: 'seguimiento' as const,
    paciente: 'Ana Martínez',
    descripcion: '¿Cómo has estado después de la consulta? Estamos aquí para ayudarte.',
    prioridad: 'media' as const,
    fecha: 'hace 3 días',
  },
]

// Sample insights for demo
const sampleInsights = [
  {
    id: '1',
    type: 'warning' as const,
    content: (
      <>
        Detectamos que <span className="text-white font-bold">Roberto Sánchez</span> tiene un
        patrón de inasistencia. Recomendamos aplicar una{' '}
        <span className="text-flash-500 underline underline-offset-4 decoration-flash-500/30">
          política de depósito previo
        </span>{' '}
        para su próxima cita.
      </>
    ),
  },
  {
    id: '2',
    type: 'tip' as const,
    content: (
      <>
        La tasa de respuesta es 24% mayor si envías el mensaje de confirmación antes de las{' '}
        <span className="text-white font-bold">10:00 AM</span>.
      </>
    ),
  },
]

export async function DashboardOverview() {
  const stats = await getStats()
  const healthScore = calculateHealthScore(stats.pendingDecisions, stats.todayAppointments)

  return (
    <div className="space-y-8">
      {/* Header section with Health Score */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black text-white">Dashboard</h2>
          <p className="mt-1 text-sm text-surface-500">
            Centro de control de operaciones de tu clínica
          </p>
        </div>
        <HealthScore score={healthScore} />
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Citas del Mes"
          value={stats.totalAppointments}
          IconComponent={Target}
          trend={{ value: 12, isPositive: true }}
        />

        <StatsCard
          title="Ingresos en Riesgo"
          value="$1,450.00"
          IconComponent={ShieldAlert}
          color="danger"
        />

        <StatsCard
          title="Tiempo Ahorrado"
          value="18.5 hrs"
          IconComponent={Zap}
          color="warning"
        />

        <StatsCard
          title="Confirmación IA"
          value="92%"
          IconComponent={Activity}
          color="info"
        />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column - Actions */}
        <div className="lg:col-span-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-flash-500" />
              Acciones Sugeridas por IA
            </h3>
          </div>

          <div className="space-y-4">
            {sampleActions.map((action) => (
              <ActionCard key={action.id} {...action} />
            ))}
          </div>

          {/* Quick stats row */}
          <div className="mt-8 grid grid-cols-2 gap-4">
            <StatsCard
              title="Total Pacientes"
              value={stats.totalPatients}
              IconComponent={Users}
              description="Pacientes registrados"
            />
            <StatsCard
              title="Citas Hoy"
              value={stats.todayAppointments}
              IconComponent={CalendarDays}
              description="Programadas para hoy"
            />
          </div>
        </div>

        {/* Right column - Insights */}
        <div className="lg:col-span-4 space-y-6">
          <InsightCard insights={sampleInsights} />
          <GoalCard title="Automatización Total" progress={66} />

          {/* Quick actions */}
          <div className="rounded-2xl border border-surface-800 bg-surface-900/40 p-6">
            <h4 className="text-sm font-bold uppercase tracking-wider text-surface-500 mb-4">
              Acciones Rápidas
            </h4>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/patients"
                className="inline-flex items-center rounded-xl bg-flash-500 px-4 py-2 text-sm font-bold text-surface-950 hover:bg-flash-400 transition-colors"
              >
                Ver Pacientes
              </Link>
              <Link
                href="/appointments"
                className="inline-flex items-center rounded-xl bg-surface-800 px-4 py-2 text-sm font-medium text-surface-300 hover:bg-surface-700 transition-colors"
              >
                Ver Citas
              </Link>
              <Link
                href="/decisions"
                className="inline-flex items-center rounded-xl bg-surface-800 px-4 py-2 text-sm font-medium text-surface-300 hover:bg-surface-700 transition-colors"
              >
                Decisiones
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

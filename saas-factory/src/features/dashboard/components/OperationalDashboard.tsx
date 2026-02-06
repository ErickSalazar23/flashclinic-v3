'use client'

import { AppointmentsMetrics } from '@/actions/appointments-metrics'
import Link from 'next/link'

interface OperationalDashboardProps {
  metrics: AppointmentsMetrics
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value)
}

function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)

  if (diffMins < 1) return 'hace unos segundos'
  if (diffMins < 60) return `hace ${diffMins} min`
  if (diffHours < 24) return `hace ${diffHours}h`
  return date.toLocaleDateString('es-ES')
}

export function OperationalDashboard({ metrics }: OperationalDashboardProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#0a1628] to-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="mb-12 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-2xl">
                🗼
              </div>
              <div>
                <h1 className="text-4xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                  Torre de Control
                </h1>
                <p className="text-slate-400 text-sm">Motor Operacional - Estado en Vivo</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-slate-400 text-sm">Flash Clinic V3</p>
            <p className="text-green-400 font-mono text-xs">Status: OPERATIVO ✓</p>
          </div>
        </div>

        {/* HERO BANNER: Weekly System Impact */}
        {metrics.weeklyRecovery && (
          <div className="mb-8 bg-gradient-to-r from-green-950/40 via-emerald-950/40 to-green-950/40 border-2 border-green-500/50 rounded-3xl p-8 shadow-2xl shadow-green-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-5xl animate-pulse">
                  {metrics.weeklyRecovery.trendDirection === 'up' ? '📈' : '✅'}
                </div>
                <div>
                  <p className="text-green-400/70 text-sm font-bold uppercase tracking-widest mb-2">
                    Sistema Trabajando Para Ti
                  </p>
                  <h2 className="text-5xl font-black text-white mb-2">
                    Esta semana recuperamos{' '}
                    <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                      {metrics.weeklyRecovery.citasRecuperadas} citas
                    </span>
                  </h2>
                  <div className="flex items-center gap-6 mt-4">
                    <div>
                      <p className="text-slate-400 text-xs uppercase">Ingresos Protegidos</p>
                      <p className="text-3xl font-black text-green-400">
                        {formatMoney(metrics.weeklyRecovery.dineroRecuperado)}
                      </p>
                    </div>
                    <div className="h-12 w-px bg-slate-700"></div>
                    <div>
                      <p className="text-slate-400 text-xs uppercase">vs Semana Pasada</p>
                      <p className={`text-2xl font-black ${
                        metrics.weeklyRecovery.comparisonVsLastWeek > 0 ? 'text-green-400' :
                        metrics.weeklyRecovery.comparisonVsLastWeek < 0 ? 'text-red-400' :
                        'text-slate-400'
                      }`}>
                        {metrics.weeklyRecovery.comparisonVsLastWeek > 0 ? '+' : ''}
                        {metrics.weeklyRecovery.comparisonVsLastWeek}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-slate-400 text-sm mb-2">Sin tu intervención</p>
                <div className="flex items-center gap-2 text-green-400">
                  <span className="text-4xl">🤖</span>
                  <span className="text-sm font-bold">Sistema Autónomo</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* HERO KPI SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* KPI: Hemorragia Hoy */}
          <div className="group bg-gradient-to-br from-slate-900/50 to-slate-800/50 border border-red-500/30 rounded-2xl p-6 hover:border-red-500/60 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-red-400/70 text-xs font-bold uppercase tracking-widest mb-2">
                  💀 Hemorragia Hoy
                </p>
                <div className="text-4xl font-black text-red-400">{formatMoney(metrics.hemorragiaHoy)}</div>
              </div>
              <div className="text-3xl opacity-20">📉</div>
            </div>
            <p className="text-slate-400 text-xs">Pérdida por cancelaciones/no-shows</p>
            <div className="mt-3 h-1 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500/80 transition-all"
                style={{ width: `${Math.min((metrics.hemorragiaHoy / 500) * 100, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* KPI: Dinero Recuperado */}
          <div className="group bg-gradient-to-br from-slate-900/50 to-slate-800/50 border border-green-500/30 rounded-2xl p-6 hover:border-green-500/60 hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-green-400/70 text-xs font-bold uppercase tracking-widest mb-2">
                  ✨ Dinero Recuperado
                </p>
                <div className="text-4xl font-black text-green-400">{formatMoney(metrics.dineroRecuperado)}</div>
              </div>
              <div className="text-3xl opacity-20">📈</div>
            </div>
            <p className="text-slate-400 text-xs">Por citas confirmadas hoy</p>
            <div className="mt-3 h-1 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500/80 transition-all"
                style={{ width: `${Math.min((metrics.dineroRecuperado / 500) * 100, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* KPI: Citas en Riesgo */}
          <div className="group bg-gradient-to-br from-slate-900/50 to-slate-800/50 border border-orange-500/30 rounded-2xl p-6 hover:border-orange-500/60 hover:shadow-lg hover:shadow-orange-500/20 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-orange-400/70 text-xs font-bold uppercase tracking-widest mb-2">
                  ⚠️ Citas en Riesgo
                </p>
                <div className="text-4xl font-black text-orange-400">{metrics.citasEnRiesgo}</div>
              </div>
              <div className="text-3xl opacity-20">🎯</div>
            </div>
            <p className="text-slate-400 text-xs">Pendientes confirmación (24h)</p>
            <div className="mt-3 h-1 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500/80 transition-all"
                style={{ width: `${Math.min((metrics.citasEnRiesgo / 20) * 100, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* KPI: Tasa No-Show */}
          <div className="group bg-gradient-to-br from-slate-900/50 to-slate-800/50 border border-cyan-500/30 rounded-2xl p-6 hover:border-cyan-500/60 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-cyan-400/70 text-xs font-bold uppercase tracking-widest mb-2">
                  📊 Tasa No-Show
                </p>
                <div className="text-4xl font-black text-cyan-400">{metrics.tasaNoShow}%</div>
              </div>
              <div className="text-3xl opacity-20">📈</div>
            </div>
            <p className="text-slate-400 text-xs">Histórico vs Benchmark (15-25%)</p>
            <div className="mt-3 h-1 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-500/80 transition-all"
                style={{ width: `${Math.min((metrics.tasaNoShow / 25) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* OPERATIONAL SUMMARY SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Resumen de Hoy */}
          <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border border-cyan-500/30 rounded-2xl p-6 hover:border-cyan-500/60 transition-all">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <span className="text-2xl">📊</span>
              Resumen de Hoy
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                <span className="text-slate-300 font-semibold">Total de Citas</span>
                <span className="text-2xl font-black text-cyan-400">{metrics.citasHoy}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                <span className="text-slate-300 font-semibold">✅ Confirmadas</span>
                <span className="text-2xl font-black text-green-400">{metrics.citasConfirmadas}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                <span className="text-slate-300 font-semibold">⏳ Pendientes</span>
                <span className="text-2xl font-black text-orange-400">{metrics.citasPendientesConfirmacion}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                <span className="text-slate-300 font-semibold">❌ Canceladas</span>
                <span className="text-2xl font-black text-red-400">{metrics.citasCanceladas}</span>
              </div>
            </div>
          </div>

          {/* Hemorragia del Mes */}
          <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border border-red-500/30 rounded-2xl p-6 hover:border-red-500/60 transition-all">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <span className="text-2xl">💰</span>
              Impacto Financiero
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-widest mb-2">Pérdida Este Mes</p>
                <p className="text-3xl font-black text-red-400">{formatMoney(metrics.hemorragiaMes)}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-widest mb-2">Dinero en Riesgo (Hoy)</p>
                <p className="text-3xl font-black text-orange-400">{formatMoney(metrics.dineroEnRiesgo)}</p>
              </div>
              <div className="mt-6 p-4 bg-green-950/30 border border-green-500/30 rounded-lg">
                <p className="text-green-400/80 text-xs font-bold uppercase tracking-widest mb-1">
                  Potencial de Recuperación
                </p>
                <p className="text-2xl font-black text-green-400">{formatMoney(metrics.dineroRecuperado)}</p>
              </div>
            </div>
          </div>

          {/* Motor Operacional - Recuperaciones Recientes */}
          <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border border-violet-500/30 rounded-2xl p-6 hover:border-violet-500/60 transition-all">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <span className="text-2xl">🤖</span>
              Recuperaciones Recientes
            </h3>
            <div className="space-y-3">
              {metrics.recentRecoveries && metrics.recentRecoveries.length > 0 ? (
                metrics.recentRecoveries.slice(0, 4).map(recovery => (
                  <div key={recovery.id} className="flex items-start gap-2 p-3 bg-green-950/20 border border-green-500/20 rounded-lg">
                    <div className="text-green-400 mt-0.5 text-lg">✓</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-200 text-sm font-semibold">
                        {recovery.patientName}
                      </p>
                      <p className="text-slate-400 text-xs mt-1">
                        {recovery.appointmentDate}
                      </p>
                      <p className="text-green-400/60 text-xs mt-1">
                        {formatRelativeTime(recovery.recoveredAt)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center">
                  <p className="text-slate-400 text-sm">Sistema monitoreando citas</p>
                  <p className="text-slate-500 text-xs mt-2">Las recuperaciones aparecerán aquí</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* NAVIGATION MENU */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <Link
            href="/prospects"
            className="group p-6 bg-gradient-to-br from-slate-900/50 to-slate-800/50 border border-cyan-500/30 rounded-2xl hover:border-cyan-500/60 hover:shadow-lg hover:shadow-cyan-500/20 transition-all"
          >
            <div className="text-3xl mb-3">🔍</div>
            <h4 className="font-bold text-white mb-2">Prospectos</h4>
            <p className="text-slate-400 text-sm">Gestiona tu pipeline de ventas</p>
          </Link>

          <Link
            href="/pendientes"
            className="group p-6 bg-gradient-to-br from-slate-900/50 to-slate-800/50 border border-orange-500/30 rounded-2xl hover:border-orange-500/60 hover:shadow-lg hover:shadow-orange-500/20 transition-all"
          >
            <div className="text-3xl mb-3">⚡</div>
            <h4 className="font-bold text-white mb-2">Pendientes</h4>
            <p className="text-slate-400 text-sm">Decisiones y acciones urgentes</p>
          </Link>

          <Link
            href="/landing"
            className="group p-6 bg-gradient-to-br from-slate-900/50 to-slate-800/50 border border-violet-500/30 rounded-2xl hover:border-violet-500/60 hover:shadow-lg hover:shadow-violet-500/20 transition-all"
          >
            <div className="text-3xl mb-3">🎯</div>
            <h4 className="font-bold text-white mb-2">Calculadora de Fugas</h4>
            <p className="text-slate-400 text-sm">Diagnóstico de hemorragia financiera</p>
          </Link>
        </div>

        {/* CTA SECTION */}
        <div className="p-8 bg-gradient-to-r from-cyan-950/30 via-blue-950/30 to-violet-950/30 border border-cyan-500/30 rounded-2xl text-center">
          <h4 className="text-2xl font-bold text-white mb-3">🤖 Sistema Autónomo</h4>
          <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
            El motor operacional está escaneando citas en tiempo real. Las confirmaciones automáticas se enviarán vía
            WhatsApp según se configuren. (En Phase 4)
          </p>
          <button className="px-8 py-3 bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500 text-white font-bold rounded-lg hover:shadow-xl hover:shadow-cyan-500/50 transition-all transform hover:scale-105">
            Ver Prescripciones 🎯
          </button>
        </div>
      </div>
    </div>
  )
}

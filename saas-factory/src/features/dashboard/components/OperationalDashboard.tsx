'use client'

import { AppointmentsMetrics } from '@/actions/appointments-metrics'
import Link from 'next/link'
import { UserDropdown } from '@/components/UserDropdown'
import { SuccessLoop } from './SuccessLoop'
import { FloatingChat } from '@/components/chat/FloatingChat'

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
    <div className="min-h-screen bg-slate-950 text-white p-6 relative overflow-hidden font-sans">
      {/* CAPA DE DISEÑO AAA: Brillos de autoridad */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* HEADER DE AUTORIDAD */}
        <div className="mb-10 flex items-center justify-between bg-slate-900/40 backdrop-blur-md p-6 rounded-3xl border border-slate-800/50 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-600 flex items-center justify-center text-3xl shadow-lg shadow-sky-500/20">
              🗼
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-sky-300 via-sky-100 to-indigo-300 bg-clip-text text-transparent">
                Torre de Control V3
              </h1>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Sistema de Inteligencia Médica • Activo</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:block text-right">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Propriedad de</p>
              <p className="text-sm font-bold text-sky-400">Dr. Salazar</p>
            </div>
            <div className="h-10 w-px bg-slate-800"></div>
            <UserDropdown />
          </div>
        </div>

        {/* ALERTA DE HEMORRAGIA (Narrativa del Dolor) */}
        <div className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-gradient-to-br from-red-950/20 to-slate-900/40 border-2 border-red-500/30 rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <span className="px-3 py-1 bg-red-500/10 text-red-500 text-[10px] font-black tracking-[0.2em] rounded-full border border-red-500/20">
                  CRITICAL FINANCIAL LEAK
                </span>
                <h2 className="text-4xl font-black mt-4 mb-2 uppercase italic italic">
                  Hemorragia Proyectada: <br/>
                  <span className="text-red-500">{formatMoney(metrics.hemorragiaHoy)}</span>
                </h2>
                <p className="text-slate-400 text-sm max-w-md">
                  Esta cifra no es solo una cita perdida; representa el **Lifetime Value (LTV)** y el costo de oportunidad de slots vacíos que tu clínica está drenando hoy.
                </p>
              </div>
              <div className="hidden md:flex flex-col items-center">
                <div className="text-6xl mb-2 grayscale opacity-50">💔</div>
                <button className="text-[10px] font-bold text-red-400 underline underline-offset-4 tracking-widest hover:text-red-300 transition-colors uppercase">
                  Ver Bitácora de Perdidas
                </button>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-sky-950/20 to-slate-900/40 border border-sky-500/20 rounded-3xl p-8 flex flex-col justify-center">
            <p className="text-sky-400/70 text-[10px] font-black tracking-[0.2em] uppercase mb-4">Capital Rescatado</p>
            <div className="text-5xl font-black text-white mb-2">{formatMoney(metrics.dineroRecuperado)}</div>
            <div className="flex items-center gap-2 text-green-400 text-sm font-bold">
              <span>↑ 12%</span>
              <span className="text-slate-500 font-normal">vs periodo anterior</span>
            </div>
            <div className="mt-6 flex gap-1">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className={`h-1 flex-1 rounded-full ${i <= 4 ? 'bg-sky-500' : 'bg-slate-800'}`}></div>
              ))}
            </div>
          </div>
        </div>

        {/* GRID DE MÉTRICAS VIVAS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Citas en Riesgo', value: metrics.citasPendientesConfirmacion, sub: 'Fuga Potencial', icon: '⚠️', color: 'border-amber-500/20 text-amber-500' },
            { label: 'Rescates Exitosos', value: metrics.weeklyRecovery?.citasRecuperadas || 0, sub: 'Esta Semana', icon: '💎', color: 'border-sky-500/20 text-sky-400' },
            { label: 'Activos Cognitivos', value: '12', sub: 'Documentados', icon: '🧠', color: 'border-indigo-500/20 text-indigo-400' },
            { label: 'Eficiencia IA', value: '94%', sub: 'Nivel Óptimo', icon: '⚡', color: 'border-emerald-500/20 text-emerald-400' }
          ].map((kpi, i) => (
            <div key={i} className={`bg-slate-900/30 border ${kpi.color.split(' ')[0]} rounded-2xl p-6 backdrop-blur-sm group hover:scale-[1.02] transition-all`}>
              <div className="flex justify-between items-start mb-2">
                <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">{kpi.label}</p>
                <span className="text-xl rotate-12 group-hover:rotate-0 transition-transform">{kpi.icon}</span>
              </div>
              <div className={`text-3xl font-black ${kpi.color.split(' ')[1]}`}>{kpi.value}</div>
              <p className="text-slate-500 text-[10px] mt-1 font-medium">{kpi.sub}</p>
            </div>
          ))}
        </div>

        {/* FEED DE ACCIÓN Y CEREBRO */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {/* CEREBRO EN ACCIÓN (Módulo de Agentes) */}
          <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-3xl p-8 relative overflow-hidden shadow-inner font-mono">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(56,189,248,0.05),transparent)] pointer-events-none"></div>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-sky-500 shadow-[0_0_10px_rgba(56,189,248,1)] animate-pulse"></div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-sky-400">Cerebro en Acción</h3>
              </div>
              <span className="text-[10px] text-slate-500">v3.0.4-STABLE</span>
            </div>

            <div className="space-y-4">
              {[
                { agent: 'DOC-AGNT', action: 'Analizando hemorragia en agenda...', status: 'RUNNING', color: 'text-sky-400' },
                { agent: 'RECV-BOT', action: 'Confirmando cita de "Sr. García"...', status: 'SUCCESS', color: 'text-emerald-400' },
                { agent: 'META-DOC', action: 'Actualizando Arquitectura de Claridad...', status: 'COMPLETED', color: 'text-indigo-400' }
              ].map((log, i) => (
                <div key={i} className="flex items-center gap-4 text-xs">
                  <span className="text-slate-600">[{new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}]</span>
                  <span className={`font-bold ${log.color}`}>{log.agent}</span>
                  <span className="text-slate-400">::</span>
                  <span className="text-slate-200">{log.action}</span>
                  <div className="flex-1 border-b border-dashed border-slate-800"></div>
                  <span className={`text-[10px] font-bold ${log.status === 'RUNNING' ? 'animate-pulse text-sky-400' : 'text-slate-500'}`}>
                    {log.status}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-800/50 flex items-center justify-between">
              <p className="text-[10px] text-slate-500">
                <span className="text-sky-500 font-bold">INFO:</span> Todos los agentes operando bajo protocolos AAA.
              </p>
              <div className="flex gap-1">
                {[1, 2, 3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-sky-500/50"></div>)}
              </div>
            </div>
          </div>

          {/* PREINSCRIPCIONES (Palanca de Control) */}
          <div className="bg-slate-900/30 border border-slate-800 rounded-3xl p-8 border-l-4 border-l-indigo-500">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              🎯 Próximos Pasos
            </h3>
            <div className="space-y-6">
              <div className="group cursor-pointer">
                <p className="text-[10px] font-bold text-indigo-400 uppercase mb-1 tracking-widest">Inmediato</p>
                <p className="text-sm text-slate-200 group-hover:text-white transition-colors">Activar rescate automático para el Dr. Salazar</p>
              </div>
              <div className="h-px bg-slate-800"></div>
              <div className="group cursor-pointer opacity-50">
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-widest">Próximamente</p>
                <p className="text-sm text-slate-400">Actualizar activos cognitivos de Restaurante</p>
              </div>
              <button className="w-full mt-6 py-4 bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-sky-500/20 hover:scale-[1.02] active:scale-95 transition-all">
                Ejecutar Plan Cognitivo
              </button>
            </div>
          </div>
        </div>

        {/* SUCCESS LOOP FEEDBACK */}
        <SuccessLoop />

        {/* ASISTENTE COGNITIVO FLOTANTE (3 PALANCAS) */}
        <FloatingChat />

        {/* FOOTER NAV RAPIDO */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Interesados', icon: '🔍', href: '/prospects' },
            { label: 'Bitácora', icon: '📖', href: '/dashboard/logs' },
            { label: 'Configuración', icon: '⚙️', href: '/settings' },
            { label: 'Ecosistema', icon: '🌐', href: '/ecosystem' }
          ].map(btn => (
            <Link key={btn.label} href={btn.href} className="p-4 bg-slate-900/40 border border-slate-800 rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-800 transition-all group">
              <span className="text-lg grayscale group-hover:grayscale-0 transition-all">{btn.icon}</span>
              <span className="text-xs font-bold text-slate-500 group-hover:text-white transition-colors">{btn.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

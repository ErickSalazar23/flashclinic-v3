import { Suspense } from 'react'

export const dynamic = 'force-dynamic'

export default function ControlTowerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#0a1628] to-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <span className="text-2xl">🗼</span>
            </div>
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                Torre de Control
              </h1>
              <p className="text-slate-400 text-sm">Enterprise CRM - Operaciones en Tiempo Real</p>
            </div>
          </div>
        </div>

        {/* KPIs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* KPI 1: Hemorragia Mensual */}
          <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border border-red-500/30 rounded-2xl p-6 hover:border-red-500/60 transition">
            <p className="text-red-400/70 text-sm font-bold uppercase tracking-wide mb-3">💀 Hemorragia Mensual</p>
            <div className="text-4xl font-black text-red-400 mb-2">$0</div>
            <p className="text-slate-400 text-xs">Pérdida por sillas vacías</p>
            <div className="mt-4 h-1 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full w-1/3 bg-red-500/60"></div>
            </div>
          </div>

          {/* KPI 2: Potencial de Recuperación */}
          <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border border-green-500/30 rounded-2xl p-6 hover:border-green-500/60 transition">
            <p className="text-green-400/70 text-sm font-bold uppercase tracking-wide mb-3">✨ Potencial Recupero</p>
            <div className="text-4xl font-black text-green-400 mb-2">$0/mes</div>
            <p className="text-slate-400 text-xs">Con Flash Clinic implementado</p>
            <div className="mt-4 h-1 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full w-2/3 bg-green-500/60"></div>
            </div>
          </div>

          {/* KPI 3: Tasa de No-show */}
          <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border border-orange-500/30 rounded-2xl p-6 hover:border-orange-500/60 transition">
            <p className="text-orange-400/70 text-sm font-bold uppercase tracking-wide mb-3">⚠️ Tasa No-Show</p>
            <div className="text-4xl font-black text-orange-400 mb-2">0%</div>
            <p className="text-slate-400 text-xs">Benchmark industria: 15-25%</p>
            <div className="mt-4 h-1 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full w-0 bg-orange-500/60"></div>
            </div>
          </div>

          {/* KPI 4: Lead Score */}
          <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border border-cyan-500/30 rounded-2xl p-6 hover:border-cyan-500/60 transition">
            <p className="text-cyan-400/70 text-sm font-bold uppercase tracking-wide mb-3">🎯 Salud del CRM</p>
            <div className="text-4xl font-black text-cyan-400 mb-2">0/100</div>
            <p className="text-slate-400 text-xs">Basado en actividad y datos</p>
            <div className="mt-4 h-1 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full w-0 bg-cyan-500/60"></div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Chart 1: Sillas Vacías vs Rentabilidad */}
          <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border border-cyan-500/30 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <span className="text-2xl">📊</span>
              Sillas Vacías vs Rentabilidad
            </h3>
            <div className="flex items-end justify-around h-48 gap-4">
              {/* Placeholder for chart */}
              <div className="flex-1 bg-gradient-to-t from-red-500/40 to-red-500/20 rounded-lg flex items-end justify-center text-red-400 font-bold">
                <span>0%</span>
              </div>
              <div className="flex-1 bg-gradient-to-t from-green-500/40 to-green-500/20 rounded-lg flex items-end justify-center text-green-400 font-bold">
                <span>0%</span>
              </div>
            </div>
            <div className="flex justify-around mt-4 text-xs text-slate-400">
              <span>Vacías</span>
              <span>Rentables</span>
            </div>
          </div>

          {/* Chart 2: Pipeline por Estado */}
          <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border border-violet-500/30 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <span className="text-2xl">🔀</span>
              Pipeline de Prospectos
            </h3>
            <div className="space-y-4">
              {[
                { label: 'Agenda Detenida', value: 0, color: 'from-slate-500' },
                { label: 'En Diagnóstico', value: 0, color: 'from-yellow-500' },
                { label: 'Tratamiento', value: 0, color: 'from-blue-500' },
                { label: 'Recuperación', value: 0, color: 'from-green-500' }
              ].map((stage) => (
                <div key={stage.label}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-300">{stage.label}</span>
                    <span className="text-slate-400 font-semibold">{stage.value}</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className={`h-full bg-gradient-to-r ${stage.color} to-transparent opacity-60`}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border border-cyan-500/30 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <span className="text-2xl">📝</span>
            Actividad Reciente
          </h3>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-cyan-500/30 transition">
                <div className="w-3 h-3 rounded-full bg-cyan-500 mt-2 flex-shrink-0"></div>
                <div className="flex-1">
                  <p className="text-slate-300 text-sm font-semibold">Cargando actividad reciente...</p>
                  <p className="text-slate-500 text-xs mt-1">Conectado a tu base de datos</p>
                </div>
                <span className="text-slate-400 text-xs whitespace-nowrap">Hace --</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA: Conectar Datos */}
        <div className="mt-8 p-8 bg-gradient-to-br from-cyan-950/30 to-blue-950/30 border border-cyan-500/30 rounded-2xl text-center">
          <h4 className="text-xl font-bold text-white mb-2">🔗 Conecta tus Datos</h4>
          <p className="text-slate-300 mb-6">
            Importa métricas de tu software actual para obtener un diagnóstico 100% preciso
          </p>
          <button className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition">
            Importar Datos Ahora 📥
          </button>
        </div>
      </div>
    </div>
  )
}

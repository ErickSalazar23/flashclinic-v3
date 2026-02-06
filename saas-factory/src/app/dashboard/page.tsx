import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default function DashboardPage() {
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
                <p className="text-slate-400 text-sm">Enterprise CRM - Panel de Operaciones</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-slate-400 text-sm">Flash Clinic V3</p>
            <p className="text-cyan-400 font-mono text-xs">Status: OPERATIVO ✓</p>
          </div>
        </div>

        {/* HERO KPI SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* KPI: Hemorragia */}
          <div className="group bg-gradient-to-br from-slate-900/50 to-slate-800/50 border border-red-500/30 rounded-2xl p-6 hover:border-red-500/60 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-red-400/70 text-xs font-bold uppercase tracking-widest mb-2">💀 Hemorragia</p>
                <div className="text-4xl font-black text-red-400">$0</div>
              </div>
              <div className="text-3xl opacity-20">📉</div>
            </div>
            <p className="text-slate-400 text-xs">Pérdida por sillas vacías (mes)</p>
            <div className="mt-3 h-1 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full w-0 bg-red-500/80"></div>
            </div>
          </div>

          {/* KPI: Recuperación */}
          <div className="group bg-gradient-to-br from-slate-900/50 to-slate-800/50 border border-green-500/30 rounded-2xl p-6 hover:border-green-500/60 hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-green-400/70 text-xs font-bold uppercase tracking-widest mb-2">✨ Recuperación</p>
                <div className="text-4xl font-black text-green-400">$0</div>
              </div>
              <div className="text-3xl opacity-20">📈</div>
            </div>
            <p className="text-slate-400 text-xs">Potencial con Flash Clinic (70%)</p>
            <div className="mt-3 h-1 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full w-0 bg-green-500/80"></div>
            </div>
          </div>

          {/* KPI: No-shows */}
          <div className="group bg-gradient-to-br from-slate-900/50 to-slate-800/50 border border-orange-500/30 rounded-2xl p-6 hover:border-orange-500/60 hover:shadow-lg hover:shadow-orange-500/20 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-orange-400/70 text-xs font-bold uppercase tracking-widest mb-2">⚠️ No-shows</p>
                <div className="text-4xl font-black text-orange-400">0%</div>
              </div>
              <div className="text-3xl opacity-20">🎯</div>
            </div>
            <p className="text-slate-400 text-xs">Tasa actual vs Benchmark (15-25%)</p>
            <div className="mt-3 h-1 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full w-0 bg-orange-500/80"></div>
            </div>
          </div>

          {/* KPI: Salud CRM */}
          <div className="group bg-gradient-to-br from-slate-900/50 to-slate-800/50 border border-cyan-500/30 rounded-2xl p-6 hover:border-cyan-500/60 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-cyan-400/70 text-xs font-bold uppercase tracking-widest mb-2">🎯 Salud CRM</p>
                <div className="text-4xl font-black text-cyan-400">0%</div>
              </div>
              <div className="text-3xl opacity-20">💻</div>
            </div>
            <p className="text-slate-400 text-xs">Health Score basado en actividad</p>
            <div className="mt-3 h-1 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full w-0 bg-cyan-500/80"></div>
            </div>
          </div>
        </div>

        {/* CHARTS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Chart 1: Sillas vs Rentabilidad */}
          <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border border-cyan-500/30 rounded-2xl p-6 hover:border-cyan-500/60 transition-all">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <span className="text-2xl">📊</span>
              Análisis: Sillas Vacías vs Rentabilidad
            </h3>
            <div className="flex items-end justify-around h-48 gap-4">
              <div className="flex-1 bg-gradient-to-t from-red-500/40 to-red-500/10 rounded-lg flex flex-col items-center justify-end pb-4 border border-red-500/20">
                <span className="text-red-400 font-bold text-2xl">0%</span>
                <span className="text-slate-400 text-xs mt-2">Vacías</span>
              </div>
              <div className="flex-1 bg-gradient-to-t from-green-500/40 to-green-500/10 rounded-lg flex flex-col items-center justify-end pb-4 border border-green-500/20">
                <span className="text-green-400 font-bold text-2xl">0%</span>
                <span className="text-slate-400 text-xs mt-2">Rentables</span>
              </div>
            </div>
          </div>

          {/* Chart 2: Pipeline */}
          <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border border-violet-500/30 rounded-2xl p-6 hover:border-violet-500/60 transition-all">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <span className="text-2xl">🔀</span>
              Pipeline de Prospectos
            </h3>
            <div className="space-y-4">
              {[
                { label: 'Agenda Detenida', color: 'from-slate-500', value: 0 },
                { label: 'En Diagnóstico', color: 'from-yellow-500', value: 0 },
                { label: 'Tratamiento', color: 'from-blue-500', value: 0 },
                { label: 'Recuperación', color: 'from-green-500', value: 0 }
              ].map((stage) => (
                <div key={stage.label}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-300 font-semibold">{stage.label}</span>
                    <span className="text-cyan-400 font-bold">{stage.value}</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className={`h-full bg-gradient-to-r ${stage.color} to-transparent opacity-60 w-0 transition-all`}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* NAVIGATION MENU */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <Link href="/prospects" className="group p-6 bg-gradient-to-br from-slate-900/50 to-slate-800/50 border border-cyan-500/30 rounded-2xl hover:border-cyan-500/60 hover:shadow-lg hover:shadow-cyan-500/20 transition-all">
            <div className="text-3xl mb-3">🔍</div>
            <h4 className="font-bold text-white mb-2">Prospectos</h4>
            <p className="text-slate-400 text-sm">Gestiona tu pipeline de ventas</p>
          </Link>

          <Link href="/pendientes" className="group p-6 bg-gradient-to-br from-slate-900/50 to-slate-800/50 border border-orange-500/30 rounded-2xl hover:border-orange-500/60 hover:shadow-lg hover:shadow-orange-500/20 transition-all">
            <div className="text-3xl mb-3">⚡</div>
            <h4 className="font-bold text-white mb-2">Pendientes</h4>
            <p className="text-slate-400 text-sm">Decisiones y acciones urgentes</p>
          </Link>

          <Link href="/landing" className="group p-6 bg-gradient-to-br from-slate-900/50 to-slate-800/50 border border-violet-500/30 rounded-2xl hover:border-violet-500/60 hover:shadow-lg hover:shadow-violet-500/20 transition-all">
            <div className="text-3xl mb-3">🎯</div>
            <h4 className="font-bold text-white mb-2">Calculadora de Fugas</h4>
            <p className="text-slate-400 text-sm">Diagnóstico de hemorragia financiera</p>
          </Link>
        </div>

        {/* CTA SECTION */}
        <div className="p-8 bg-gradient-to-r from-cyan-950/30 via-blue-950/30 to-violet-950/30 border border-cyan-500/30 rounded-2xl text-center">
          <h4 className="text-2xl font-bold text-white mb-3">🔗 Conecta tus Datos Reales</h4>
          <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
            Importa tus métricas actuales para obtener un diagnóstico 100% preciso de tu hemorragia financiera
          </p>
          <button className="px-8 py-3 bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500 text-white font-bold rounded-lg hover:shadow-xl hover:shadow-cyan-500/50 transition-all transform hover:scale-105">
            Conectar Datos Ahora 📥
          </button>
        </div>
      </div>
    </div>
  )
}

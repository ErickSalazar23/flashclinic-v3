import { DashboardCalculator } from '@/components/DashboardCalculator'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function CalculatorPage() {
  // PALANCA 2: Fetch clinic config if it exists (for precargado values)
  // For now, use defaults - can be extended to read from a clinic_config table
  const defaultPatients = 12
  const defaultTicket = 60
  const defaultNoshows = 20
  const defaultDays = 22

  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-950 to-slate-950 text-white p-6 flex items-center justify-center">
          <div className="max-w-md text-center">
            <h1 className="text-3xl font-bold text-red-400 mb-4">No autenticado</h1>
            <p className="text-slate-300 mb-6">Por favor inicia sesión para acceder a la calculadora</p>
            <Link href="/login" className="px-6 py-3 bg-cyan-500 text-white font-bold rounded-lg hover:bg-cyan-600 transition">
              Ir a Login
            </Link>
          </div>
        </div>
      )
    }
  } catch (error) {
    console.error('Error in calculator page:', error)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-950 to-slate-950 text-white p-6 relative overflow-hidden">
      {/* PALANCA 3: Identidad Neón Total - Fondo matching con dashboard */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 via-transparent to-transparent"></div>
      </div>

      <div className="relative">
        <div className="max-w-6xl mx-auto">
          {/* HEADER - Sin marketing */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Link href="/dashboard" className="text-cyan-400 hover:text-cyan-300 transition">
                ← Volver al Dashboard
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-2xl">
                📊
              </div>
              <div>
                <h1 className="text-4xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                  Calculadora de Hemorragia
                </h1>
                <p className="text-slate-400 text-sm mt-1">Ajusta los parámetros para ver el impacto en tiempo real</p>
              </div>
            </div>
          </div>

          {/* PALANCA 1: Inputs sin marketing + PALANCA 2: Resultados brillantes */}
          <DashboardCalculator
            initialPatients={defaultPatients}
            initialTicket={defaultTicket}
            initialNoshows={defaultNoshows}
            initialDays={defaultDays}
          />

          {/* PALANCA 3: Footer con instrucciones operacionales */}
          <div className="mt-12 p-6 bg-slate-800/30 border border-slate-700/30 rounded-2xl text-center">
            <p className="text-slate-400 text-sm mb-2">
              💡 Tip: Ajusta los valores arriba para simular diferentes escenarios. Flash Clinic optimiza cada uno de estos parámetros automáticamente.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

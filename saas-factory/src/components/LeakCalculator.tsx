'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function LeakCalculator() {
  const [patients, setPatients] = useState(12)
  const [ticket, setTicket] = useState(60)
  const [noshows, setNoshows] = useState(20)
  const [days, setDays] = useState(22)

  const [monthlyLoss, setMonthlyLoss] = useState(0)
  const [yearlyLoss, setYearlyLoss] = useState(0)
  const [lostPatients, setLostPatients] = useState(0)
  const [potentialRecovery, setPotentialRecovery] = useState(0)

  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [ctaHref, setCtaHref] = useState('/signup?intent=dashboard')

  const supabase = createClient()

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setIsLoggedIn(true)
          setCtaHref('/dashboard')
        } else {
          setIsLoggedIn(false)
          setCtaHref('/signup?intent=dashboard')
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        setCtaHref('/signup?intent=dashboard')
      }
    }
    checkAuth()
  }, [supabase])

  // Calculate metrics
  useEffect(() => {
    const appointmentsPerDay = patients
    const feePerPatient = ticket
    const noShowPercentage = noshows / 100
    const workingDays = days

    // Protocolo Matemático Estricto
    // 1. Citas Perdidas/Mes (Redondeado para coherencia humana)
    const lostAppointmentsPerMonth = Math.round((appointmentsPerDay * noShowPercentage) * workingDays)
    
    // 2. Fuga Mensual = (Honorario Promedio) x (Citas Perdidas/Mes)
    const monthly = feePerPatient * lostAppointmentsPerMonth
    
    // 3. Cálculo Anual = Fuga Mensual x 12
    const yearly = monthly * 12
    
    // 4. Lógica de Potencial (70% de la Fuga Mensual)
    // Ajustado a múltiplos de 10 para mayor claridad comercial
    const rawRecovery = monthly * 0.7
    const recovery = Math.round(rawRecovery / 10) * 10

    setMonthlyLoss(monthly)
    setYearlyLoss(yearly)
    setLostPatients(lostAppointmentsPerMonth)
    setPotentialRecovery(recovery)
  }, [patients, ticket, noshows, days])

  const formatMoney = (value: number) => {
    const formatted = new Intl.NumberFormat('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
    return `$ ${formatted}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#0a1628] to-slate-950 px-4 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Grid: Inputs (Izq) + Resultados (Der) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* PANEL IZQUIERDO - INPUTS */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-cyan-500/20 rounded-3xl p-8 shadow-2xl">
            <div className="mb-8">
              <h2 className="text-4xl font-black text-white mb-2">
                Diagnóstico de <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">Hemorragia</span>
              </h2>
              <p className="text-cyan-300/80 text-sm font-light">
                ¿Cuánto dinero pierdes por sillas vacías cada mes?
              </p>
            </div>

            {/* INPUT: Pacientes */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-cyan-300 mb-3">
                📊 Citas agendadas por jornada
              </label>
              <input
                type="range"
                min="1"
                max="100"
                value={patients}
                onChange={(e) => setPatients(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <div className="flex justify-between items-center mt-2">
                <input
                  type="number"
                  value={patients}
                  onChange={(e) => setPatients(Number(e.target.value))}
                  className="w-20 px-3 py-2 bg-slate-800 border border-cyan-500/30 rounded-lg text-white text-center font-bold hover:border-cyan-500/60 focus:border-cyan-500 focus:outline-none transition"
                />
                <span className="text-cyan-400/60 text-xs">citas/día</span>
              </div>
            </div>

            {/* INPUT: Ticket */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-cyan-300 mb-3">
                💰 Honorario promedio por paciente
              </label>
              <input
                type="range"
                min="10"
                max="500"
                step="10"
                value={ticket}
                onChange={(e) => setTicket(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-cyan-400/60 text-xs">USD</span>
                <input
                  type="number"
                  value={ticket}
                  onChange={(e) => setTicket(Number(e.target.value))}
                  className="w-20 px-3 py-2 bg-slate-800 border border-cyan-500/30 rounded-lg text-white text-center font-bold hover:border-cyan-500/60 focus:border-cyan-500 focus:outline-none transition"
                />
              </div>
            </div>

            {/* INPUT: No-shows */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-red-400 mb-3">
                ⚠️ % Sillas Vacías (Inasistencias)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={noshows}
                onChange={(e) => setNoshows(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-500"
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-red-400/60 text-xs">Sector: 15-25%</span>
                <input
                  type="number"
                  value={noshows}
                  onChange={(e) => setNoshows(Number(e.target.value))}
                  className="w-20 px-3 py-2 bg-slate-800 border border-red-500/30 rounded-lg text-white text-center font-bold hover:border-red-500/60 focus:border-red-500 focus:outline-none transition"
                />
              </div>
            </div>

            {/* INPUT: Días */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-cyan-300 mb-3">
                📅 Días hábiles al mes
              </label>
              <input
                type="number"
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="w-full px-4 py-3 bg-slate-800 border border-cyan-500/30 rounded-lg text-white font-bold text-center hover:border-cyan-500/60 focus:border-cyan-500 focus:outline-none transition"
              />
            </div>

            <button className="w-full py-4 bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-cyan-500/50 transition-all duration-300 transform hover:scale-105">
              📊 Ver Diagnóstico Completo
            </button>
          </div>

          {/* PANEL DERECHO - RESULTADOS */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border border-cyan-500/30 rounded-3xl p-8 shadow-2xl flex flex-col justify-between">
            {/* PÉRDIDA ANUAL GRANDE */}
            <div className="text-center mb-8 p-6 bg-red-950/30 border border-red-500/30 rounded-2xl">
              <p className="text-red-400/80 text-xs font-bold uppercase tracking-widest mb-3">
                💀 Hemorragia Anual
              </p>
              <div className="text-6xl font-black bg-gradient-to-r from-red-500 via-orange-500 to-red-600 bg-clip-text text-transparent mb-2">
                {formatMoney(yearlyLoss)}
              </div>
              <p className="text-slate-400 text-sm">
                Dinero que pierdes por no gestionar inasistencias
              </p>
            </div>

            {/* DETALLES */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-between p-4 bg-slate-800/50 border border-cyan-500/20 rounded-xl hover:border-cyan-500/50 transition">
                <span className="text-cyan-300 font-semibold">Fuga Mensual</span>
                <span className="text-2xl font-black text-cyan-400">{formatMoney(monthlyLoss)}</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-800/50 border border-red-500/20 rounded-xl hover:border-red-500/50 transition">
                <span className="text-red-300 font-semibold">Citas Perdidas/Mes</span>
                <span className="text-2xl font-black text-red-400">{lostPatients}</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-800/50 border border-green-500/20 rounded-xl hover:border-green-500/50 transition">
                <span className="text-green-300 font-semibold">Potencial de Recuperación</span>
                <span className="text-2xl font-black text-green-400">{formatMoney(potentialRecovery)}/mes</span>
              </div>
            </div>

            {/* RECOVERY BADGE */}
            <div className="p-6 bg-gradient-to-br from-green-950/40 to-emerald-950/40 border border-green-500/40 rounded-2xl text-center">
              <p className="text-green-400/80 text-xs font-bold uppercase tracking-widest mb-2">
                ✨ Con Flash Clinic (70% menos inasistencias)
              </p>
              <div className="text-3xl font-black text-green-400 mb-2">
                {formatMoney(potentialRecovery)}/mes
              </div>
              <p className="text-green-300/70 text-xs leading-relaxed">
                Reducción estimada de no-shows + Automatización de recordatorios + Confirmación inteligente
              </p>
            </div>
          </div>
        </div>

        {/* CTA GLOBAL */}
        <div className="text-center mt-12">
          <p className="text-slate-400 text-sm mb-4">
            ¿Quieres detener esta hemorragia?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!isLoggedIn && (
              <a
                href="/signup"
                className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl hover:shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 transform hover:scale-105 text-lg inline-block"
              >
                Crear Cuenta 🚀
              </a>
            )}
            <a
              href={ctaHref}
              className="px-8 py-4 bg-gradient-to-r from-violet-500 to-cyan-600 text-white font-bold rounded-xl hover:shadow-2xl hover:shadow-violet-500/50 transition-all duration-300 transform hover:scale-105 text-lg inline-block"
            >
              {isLoggedIn ? 'Ir a Mi Dashboard' : 'Ver Control Tower'} 🗼
            </a>
          </div>
          <p className="text-slate-500 text-xs mt-6">
            Crea una cuenta para acceder al sistema completo y configurar tus confirmaciones automáticas por WhatsApp
          </p>
        </div>
      </div>
    </div>
  )
}

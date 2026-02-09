'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { calculateAnnualLoss } from '@/lib/diagnostic-engine'

interface DashboardCalculatorProps {
  initialPatients?: number
  initialTicket?: number
  initialNoshows?: number
  initialDays?: number
}

export function DashboardCalculator({
  initialPatients = 12,
  initialTicket = 60,
  initialNoshows = 20,
  initialDays = 22,
}: DashboardCalculatorProps) {
  const [patients, setPatients] = useState(initialPatients)
  const [ticket, setTicket] = useState(initialTicket)
  const [noshows, setNoshows] = useState(initialNoshows)
  const [days, setDays] = useState(initialDays)

  const [monthlyLoss, setMonthlyLoss] = useState(0)
  const [yearlyLoss, setYearlyLoss] = useState(0)
  const [lostPatients, setLostPatients] = useState(0)
  const [potentialRecovery, setPotentialRecovery] = useState(0)

  // Calculate metrics on mount and when inputs change
  useEffect(() => {
    const yearly = calculateAnnualLoss({
      citasSemanales: patients,
      ticketPromedio: ticket,
      noShowPercentage: noshows
    })
    const monthly = yearly / 12
    const lost = Math.round((patients * (noshows / 100)) * days)
    const recovery = monthly * 0.7

    setMonthlyLoss(monthly)
    setYearlyLoss(yearly)
    setLostPatients(lost)
    setPotentialRecovery(recovery)
  }, [patients, ticket, noshows, days])

  const formatMoney = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="space-y-8">
      {/* PALANCA 1: Inputs sin marketing - Solo operativo */}
      <div className="bg-slate-900/50 backdrop-blur-xl border border-cyan-500/20 rounded-3xl p-8">
        <h3 className="text-2xl font-bold text-white mb-8">Parámetros Operacionales</h3>

        {/* INPUT: Pacientes */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold text-cyan-300">
              📊 Citas agendadas por jornada
            </label>
            <span className="text-cyan-400 font-bold">{patients}</span>
          </div>
          <input
            type="range"
            min="1"
            max="100"
            value={patients}
            onChange={(e) => setPatients(Number(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
        </div>

        {/* INPUT: Ticket */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold text-cyan-300">
              💰 Honorario promedio (USD)
            </label>
            <span className="text-cyan-400 font-bold">${ticket}</span>
          </div>
          <input
            type="range"
            min="10"
            max="500"
            step="10"
            value={ticket}
            onChange={(e) => setTicket(Number(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
        </div>

        {/* INPUT: No-shows */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold text-red-400">
              ⚠️ % Sillas Vacías
            </label>
            <span className="text-red-400 font-bold">{noshows}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={noshows}
            onChange={(e) => setNoshows(Number(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-500"
          />
        </div>

        {/* INPUT: Días */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold text-cyan-300">
              📅 Días hábiles al mes
            </label>
            <span className="text-cyan-400 font-bold">{days}</span>
          </div>
          <input
            type="number"
            min="1"
            max="31"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="w-full px-4 py-3 bg-slate-800 border border-cyan-500/30 rounded-lg text-white font-bold text-center hover:border-cyan-500/60 focus:border-cyan-500 focus:outline-none transition"
          />
        </div>
      </div>

      {/* PALANCA 2: Resultados brillantes en cian puro */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hemorragia Anual - Grande */}
        <div className="col-span-1 md:col-span-2 bg-gradient-to-br from-red-950/40 to-slate-900/50 border-2 border-red-500/40 rounded-2xl p-8 hover:border-red-500/60 transition-all">
          <p className="text-red-400/70 text-xs font-bold uppercase tracking-widest mb-4">
            💀 Hemorragia Anual
          </p>
          <div className="text-5xl font-black bg-gradient-to-r from-red-500 via-orange-500 to-red-600 bg-clip-text text-transparent">
            {formatMoney(yearlyLoss)}
          </div>
          <p className="text-slate-400 text-sm mt-3">
            Pérdida annual por no-shows sin control
          </p>
        </div>

        {/* Fuga Mensual */}
        <div className="bg-gradient-to-br from-cyan-950/40 to-slate-900/50 border-2 border-cyan-500/40 rounded-2xl p-6 hover:border-cyan-500/60 transition-all">
          <p className="text-cyan-400/70 text-xs font-bold uppercase tracking-widest mb-3">
            📉 Fuga Mensual
          </p>
          <p className="text-4xl font-black text-cyan-400">
            {formatMoney(monthlyLoss)}
          </p>
        </div>

        {/* Citas Perdidas */}
        <div className="bg-gradient-to-br from-red-950/40 to-slate-900/50 border-2 border-red-500/40 rounded-2xl p-6 hover:border-red-500/60 transition-all">
          <p className="text-red-400/70 text-xs font-bold uppercase tracking-widest mb-3">
            🚫 Citas Perdidas
          </p>
          <p className="text-4xl font-black text-red-400">
            {lostPatients}
          </p>
          <p className="text-slate-400 text-xs mt-2">por mes</p>
        </div>

        {/* Potencial de Recuperación - Con Flash */}
        <div className="col-span-1 md:col-span-2 bg-gradient-to-br from-green-950/40 to-slate-900/50 border-2 border-green-500/40 rounded-2xl p-8 hover:border-green-500/60 transition-all">
          <p className="text-green-400/70 text-xs font-bold uppercase tracking-widest mb-4">
            ✨ Con Flash Clinic (70% menos inasistencias)
          </p>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-5xl font-black text-green-400">
                {formatMoney(potentialRecovery)}
              </p>
              <p className="text-green-300/70 text-sm mt-2">
                Recuperación mensual estimada
              </p>
            </div>
            <div className="text-6xl animate-pulse">🚀</div>
          </div>
        </div>
      </div>

      {/* PALANCA 3: Identidad Neón - Sin salida visual, solo resultados */}
      <div className="bg-slate-800/30 border border-slate-700/30 rounded-2xl p-6 text-center">
        <p className="text-slate-400 text-sm">
          Estos cálculos se actualizan en tiempo real. Los valores precargados reflejan tu configuración actual.
        </p>
      </div>
    </div>
  )
}

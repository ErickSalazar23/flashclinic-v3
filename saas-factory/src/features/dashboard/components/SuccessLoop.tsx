'use client'

import { useEffect, useState } from 'react'
import { getSuccessReport, SuccessMetric } from '@/actions/success-report'

export function SuccessLoop() {
  const [report, setReport] = useState<SuccessMetric | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const result = await getSuccessReport()
      if (result.ok) {
        setReport(result.data)
      }
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="animate-pulse bg-slate-800/50 h-48 rounded-2xl" />
  if (!report || report.totalRecoveries === 0) return null

  return (
    <div className="bg-gradient-to-br from-indigo-950/40 to-slate-900/50 border border-indigo-500/30 rounded-2xl p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            ✨ Bucle de Éxito Flash
          </h3>
          <p className="text-slate-400 text-sm">El sistema está trabajando para ti en modo autónomo</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black text-indigo-400">
            {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(report.estimatedRevenueRecovered)}
          </div>
          <p className="text-[10px] text-indigo-300/60 uppercase tracking-widest font-bold">Recuperado este mes</p>
        </div>
      </div>

      <div className="space-y-3">
        {report.recentRecoveries.map((r) => (
          <div key={r.id} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs">
                ✅
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200">
                  Cita recuperada: <span className="text-indigo-400">{r.patientName}</span>
                </p>
                <p className="text-[10px] text-slate-500">
                  {new Date(r.createdAt).toLocaleDateString()} - Transición: {r.oldStatus} → {r.newStatus}
                </p>
              </div>
            </div>
            <div className="text-[10px] font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded">
              AUTÓNOMO
            </div>
          </div>
        ))}
      </div>

      {report.totalRecoveries > 5 && (
        <p className="text-center text-[10px] text-slate-500 mt-4 italic">
          + {report.totalRecoveries - 5} éxitos adicionales registrados
        </p>
      )}
    </div>
  )
}

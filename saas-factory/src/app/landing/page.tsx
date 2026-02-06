'use client'

import { useState } from 'react'
import Link from 'next/link'
import { saveLeadFromLanding } from '@/actions/landing'
import { LeakCalculator } from '@/components/LeakCalculator'

export default function LandingPage() {
  const [formData, setFormData] = useState({
    clinicName: '',
    email: '',
    phone: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showCalculator, setShowCalculator] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await saveLeadFromLanding(formData)
      if (result.success) {
        setSubmitted(true)
        setFormData({ clinicName: '', email: '', phone: '' })
        setTimeout(() => {
          setSubmitted(false)
          setShowCalculator(true)
        }, 1500)
      } else {
        setError(result.error || 'Error al guardar tus datos')
      }
    } catch (err) {
      setError('Error al procesar tu solicitud')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#0a1628] to-slate-950 text-white overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-cyan-500/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <span className="text-white font-black text-lg">⚡</span>
            </div>
            <span className="text-xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Flash Clinic
            </span>
          </div>
          <Link href="/login" className="px-6 py-2 border border-cyan-500/30 text-cyan-300 rounded-lg hover:bg-cyan-500/10 transition">
            Ingresar →
          </Link>
        </div>
      </header>

      {/* HERO SECTION */}
      {!showCalculator && (
        <section className="pt-32 pb-20 px-6">
          <div className="max-w-5xl mx-auto text-center">
            {/* Etiqueta */}
            <div className="inline-block mb-6 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full">
              <p className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
                ⚕️ Enterprise CRM para Clínicas
              </p>
            </div>

            {/* Headline */}
            <h1 className="text-6xl lg:text-7xl font-black mb-6 leading-tight">
              Detén la{' '}
              <span className="bg-gradient-to-r from-red-500 via-orange-500 to-red-600 bg-clip-text text-transparent">
                hemorragia
              </span>
              {' '}financiera de tu clínica
            </h1>

            {/* Subheadline */}
            <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Cada silla vacía es dinero que ya pagaste pero no cobraste. Flash Clinic automatiza recordatorios, confirmaciones y recupera hasta <span className="text-green-400 font-bold">70% de tus inasistencias</span>.
            </p>

            {/* CTA Principal */}
            <button
              onClick={() => document.getElementById('diagnosis-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500 text-white font-bold text-lg rounded-xl hover:shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 transform hover:scale-105 mb-12"
            >
              Descubre tu Pérdida Anual →
            </button>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="p-6 bg-slate-800/50 border border-cyan-500/20 rounded-2xl">
                <div className="text-3xl font-black text-cyan-400 mb-2">70%</div>
                <p className="text-sm text-slate-400">Reducción de No-shows</p>
              </div>
              <div className="p-6 bg-slate-800/50 border border-green-500/20 rounded-2xl">
                <div className="text-3xl font-black text-green-400 mb-2">$50K+</div>
                <p className="text-sm text-slate-400">Recupero Anual Promedio</p>
              </div>
              <div className="p-6 bg-slate-800/50 border border-violet-500/20 rounded-2xl">
                <div className="text-3xl font-black text-violet-400 mb-2">24h</div>
                <p className="text-sm text-slate-400">Implementación</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* DIAGNOSIS FORM SECTION */}
      {!showCalculator && (
        <section id="diagnosis-form" className="py-20 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="bg-gradient-to-br from-slate-900/50 to-slate-900 backdrop-blur-xl border border-cyan-500/30 rounded-3xl p-8 shadow-2xl">
              <h2 className="text-3xl font-black text-white mb-2">
                Tu Diagnóstico de <span className="text-cyan-400">Hemorragia</span>
              </h2>
              <p className="text-slate-300 mb-8">
                Completa estos datos y obtén tu análisis personalizado en tiempo real.
              </p>

              {submitted ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4 animate-bounce">✓</div>
                  <h3 className="text-2xl font-bold text-green-400 mb-2">¡Datos Guardados!</h3>
                  <p className="text-slate-300 mb-6">
                    Redirigiendo a tu calculadora personalizada...
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Nombre Clínica */}
                  <div>
                    <label className="block text-sm font-semibold text-cyan-300 mb-3">
                      Nombre de la clínica
                    </label>
                    <input
                      type="text"
                      placeholder="Clínica San José"
                      value={formData.clinicName}
                      onChange={(e) => setFormData({ ...formData, clinicName: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-800 border border-cyan-500/30 text-white rounded-lg placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-cyan-300 mb-3">
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="tu@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-800 border border-cyan-500/30 text-white rounded-lg placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition"
                      required
                    />
                  </div>

                  {/* WhatsApp */}
                  <div>
                    <label className="block text-sm font-semibold text-cyan-300 mb-3">
                      WhatsApp
                    </label>
                    <input
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-800 border border-cyan-500/30 text-white rounded-lg placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition"
                      required
                    />
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <p className="text-red-400 text-sm font-semibold">{error}</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-cyan-500/50 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Procesando...' : 'Revelar mi Diagnóstico 🩺'}
                  </button>

                  <p className="text-center text-slate-400 text-xs">
                    Acceso inmediato a tu calculadora personalizada. Sin tarjeta requerida.
                  </p>
                </form>
              )}
            </div>
          </div>
        </section>
      )}

      {/* LEAK CALCULATOR - Full Screen */}
      {showCalculator && (
        <>
          <button
            onClick={() => setShowCalculator(false)}
            className="fixed top-24 right-6 z-40 px-4 py-2 bg-slate-800 border border-cyan-500/30 text-cyan-300 rounded-lg hover:bg-slate-700 transition text-sm font-semibold"
          >
            ← Volver al formulario
          </button>
          <LeakCalculator />
        </>
      )}

      {/* Footer */}
      {!showCalculator && (
        <footer className="py-12 px-6 border-t border-slate-800">
          <div className="max-w-6xl mx-auto text-center text-slate-500 text-sm">
            <p>Flash Clinic © 2026 | Enterprise CRM para Clínicas | Powered by AI</p>
          </div>
        </footer>
      )}
    </div>
  )
}

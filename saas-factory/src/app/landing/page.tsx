'use client'

import { useState } from 'react'
import Link from 'next/link'
import { saveLeadFromLanding } from '@/actions/landing'

export default function LandingPage() {
  const [formData, setFormData] = useState({
    clinicName: '',
    email: '',
    phone: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await saveLeadFromLanding(formData)
      if (result.success) {
        setSubmitted(true)
        setFormData({ clinicName: '', email: '', phone: '' })
        setTimeout(() => setSubmitted(false), 4000)
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/20 to-slate-950">
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-sm border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <span className="text-white font-bold">⚡</span>
            </div>
            <span className="text-white font-bold">Flash Clinic</span>
          </div>
          <Link href="/login" className="text-slate-300 hover:text-white">
            Ingresar →
          </Link>
        </div>
      </header>

      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl font-bold text-white mb-6">
            La automatización que <span className="text-blue-400">multiplica ingresos</span> en clínicas
          </h1>
          <p className="text-2xl text-slate-300 mb-8">
            Flash Clinic es el software que usan clínicas líderes para llenar agendas, reducir no-shows y crecer exponencialmente.
          </p>
          <p className="text-lg text-slate-400 mb-8">
            <span className="text-yellow-400 font-semibold">⚡ Acceso Early Beta limitado</span> - Sé de los primeros en revolucionar tu clínica
          </p>
          <button
            onClick={() => document.getElementById('cta')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold px-8 py-4 rounded-lg transition-colors"
          >
            Reserva tu ingreso →
          </button>
        </div>
      </section>

      <section id="cta" className="py-20 px-6">
        <div className="max-w-2xl mx-auto bg-gradient-to-b from-blue-500/10 border border-blue-500/30 rounded-2xl p-12">
          <h2 className="text-4xl font-bold text-white text-center mb-2">
            Sé de los primeros
          </h2>
          <p className="text-slate-300 text-center mb-10">
            Acceso early beta limitado. Te avisaremos apenas esté lista para que seas de los primeros en probarla.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Nombre de la clínica"
              value={formData.clinicName}
              onChange={(e) => setFormData({ ...formData, clinicName: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-slate-400"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-slate-400"
              required
            />
            <input
              type="tel"
              placeholder="WhatsApp"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-slate-400"
              required
            />
            <button
              type="submit"
              disabled={isLoading || submitted}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-4 rounded-lg text-lg transition-colors"
            >
              {submitted ? '✓ Reserva confirmada' : isLoading ? 'Procesando...' : 'Reservar acceso →'}
            </button>
            {error && (
              <p className="text-center text-red-400 text-sm mt-2">
                {error}
              </p>
            )}
          </form>
          {submitted && (
            <p className="text-center text-slate-300 mt-4">
              ✨ Gracias por tu interés. Te contactaremos pronto cuando esté listo.
            </p>
          )}
        </div>
      </section>
    </div>
  )
}

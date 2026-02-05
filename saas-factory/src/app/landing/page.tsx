'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function LandingPage() {
  const [formData, setFormData] = useState({
    clinicName: '',
    email: '',
    phone: ''
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
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
            ¿Tu clínica pierde <span className="text-red-400">$5,000+ al mes</span> por sillas vacías?
          </h1>
          <p className="text-2xl text-slate-300 mb-8">
            Flash Clinic diagnostica tu hemorragia financiera y la cura con automatización.
          </p>
          <button
            onClick={() => document.getElementById('cta')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-red-600 hover:bg-red-700 text-white text-lg font-semibold px-8 py-4 rounded-lg"
          >
            Diagnosticar GRATIS →
          </button>
        </div>
      </section>

      <section id="cta" className="py-20 px-6">
        <div className="max-w-2xl mx-auto bg-gradient-to-b from-blue-500/10 border border-blue-500/30 rounded-2xl p-12">
          <h2 className="text-4xl font-bold text-white text-center mb-10">
            Obtén tu diagnóstico gratis
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Nombre de la clínica"
              value={formData.clinicName}
              onChange={(e) => setFormData({ ...formData, clinicName: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white"
              required
            />
            <input
              type="tel"
              placeholder="WhatsApp"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white"
              required
            />
            <button
              type="submit"
              className="w-full bg-red-600 text-white font-bold py-4 rounded-lg text-lg"
            >
              {submitted ? '✓ Enviado' : 'Obtener diagnóstico →'}
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}

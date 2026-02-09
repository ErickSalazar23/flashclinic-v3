'use client'

import { useState, useEffect } from 'react'
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
    <div className="min-h-screen bg-[#020617] text-slate-50 selection:bg-sky-500/30 selection:text-sky-400">
      {/* Luz de fondo ambiental */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-sky-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[50%] bg-indigo-500/10 blur-[120px] rounded-full"></div>
      </div>

      {/* Header Premium */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800/50 bg-[#020617]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <span className="text-white font-black text-sm">FC</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Flash<span className="text-sky-400">Clinic</span>
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#solucion" className="hover:text-white transition-colors">Solución</a>
            <a href="#diagnostico" className="hover:text-white transition-colors">Diagnóstico</a>
            <Link href="/login" className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-full border border-slate-700 transition-all font-semibold">
              Iniciar Sesión
            </Link>
          </nav>
        </div>
      </header>

      <main className="relative pt-20">
        {!showCalculator ? (
          <>
            {/* Hero Section */}
            <section className="relative py-24 md:py-32 px-6">
              <div className="max-w-5xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 mb-8">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">
                    Infraestructura Cognitiva para Clínicas v3.0
                  </span>
                </div>
                
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-8 tracking-tight leading-[1.1]">
                  Detén la <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-400">hemorragia financiera</span> de tu práctica médica
                </h1>
                
                <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
                  Automatiza la honestidad operacional. Flash Clinic recupera el <span className="text-white font-bold">70% de inasistencias</span> y optimiza cada slot de tu agenda sin intervención humana.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
                  <button 
                    onClick={() => document.getElementById('diagnosis')?.scrollIntoView({ behavior: 'smooth' })}
                    className="w-full sm:w-auto px-8 py-4 bg-sky-500 hover:bg-sky-400 text-white font-bold rounded-2xl shadow-xl shadow-sky-500/25 transition-all transform hover:scale-[1.02]"
                  >
                    Obtener Diagnóstico de Claridad →
                  </button>
                  <button className="w-full sm:w-auto px-8 py-4 bg-slate-900 border border-slate-800 text-slate-300 font-bold rounded-2xl hover:bg-slate-800 transition-all">
                    Ver Demo del Sistema
                  </button>
                </div>

                {/* Social Proof Placeholder */}
                <div className="pt-10 border-t border-slate-800/50 flex flex-wrap justify-center gap-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
                  <div className="h-8 w-24 bg-slate-700 rounded animate-pulse"></div>
                  <div className="h-8 w-32 bg-slate-700 rounded animate-pulse"></div>
                  <div className="h-8 w-20 bg-slate-700 rounded animate-pulse"></div>
                  <div className="h-8 w-28 bg-slate-700 rounded animate-pulse"></div>
                </div>
              </div>
            </section>

            {/* Teaser Section: El Problema */}
            <section id="solucion" className="py-24 px-6 bg-slate-900/30">
              <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
                <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-sky-500/30 transition-all group">
                  <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">📉</div>
                  <h3 className="text-xl font-bold text-white mb-4">Sillas Vacías</h3>
                  <p className="text-slate-400 leading-relaxed">Cada espacio no utilizado en tu agenda es un costo hundido. Nosotros los rellenamos automáticamente.</p>
                </div>
                <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-indigo-500/30 transition-all group">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">⚠️</div>
                  <h3 className="text-xl font-bold text-white mb-4">No-Shows Persistentes</h3>
                  <p className="text-slate-400 leading-relaxed">Protocolos de confirmación inteligentes que reducen el ausentismo sin molestar al paciente.</p>
                </div>
                <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-sky-500/30 transition-all group">
                  <div className="w-12 h-12 rounded-2xl bg-sky-500/10 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">🤖</div>
                  <h3 className="text-xl font-bold text-white mb-4">Infraestructura Autónoma</h3>
                  <p className="text-slate-400 leading-relaxed">No es un software más; es un agente cognitivo que trabaja 24/7 protegiendo tu rentabilidad.</p>
                </div>
              </div>
            </section>

            {/* Formulario de Diagnóstico (Lead Magnet de Autoridad) */}
            <section id="diagnostico" className="py-24 px-6 relative">
              <div className="max-w-4xl mx-auto">
                <div className="relative p-1 rounded-[2.5rem] bg-gradient-to-b from-sky-500/20 to-transparent">
                  <div className="bg-[#020617] rounded-[2.4rem] p-8 md:p-12 border border-slate-800/50 shadow-2xl shadow-sky-950/20">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                      <div>
                        <h2 className="text-3xl md:text-4xl font-black text-white mb-6 leading-tight">
                          Revela tu <span className="text-sky-400">cuello de botella</span> en 60 segundos
                        </h2>
                        <ul className="space-y-4 mb-8">
                          {['Análisis financiero en vivo', 'Benchmark vs industria', 'Protocolo de recuperación personalizado'].map((item, i) => (
                            <li key={i} className="flex items-center gap-3 text-slate-400 font-medium">
                              <span className="text-sky-500 font-bold">✓</span> {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl">
                        {submitted ? (
                          <div className="text-center py-10">
                            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center text-green-500 text-3xl mx-auto mb-6">✓</div>
                            <h3 className="text-2xl font-bold text-white mb-2">Procesando...</h3>
                            <p className="text-slate-400 text-sm">Tu diagnóstico de claridad está casi listo.</p>
                          </div>
                        ) : (
                          <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                              type="text"
                              placeholder="Nombre de la clínica"
                              value={formData.clinicName}
                              onChange={(e) => setFormData({ ...formData, clinicName: e.target.value })}
                              className="w-full h-12 px-4 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-sky-500 focus:outline-none transition-all placeholder:text-slate-600"
                              required
                            />
                            <input
                              type="email"
                              placeholder="Tu correo corporativo"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              className="w-full h-12 px-4 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-sky-500 focus:outline-none transition-all placeholder:text-slate-600"
                              required
                            />
                            <input
                              type="tel"
                              placeholder="WhatsApp de contacto"
                              value={formData.phone}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                              className="w-full h-12 px-4 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-sky-500 focus:outline-none transition-all placeholder:text-slate-600"
                              required
                            />
                            <button
                              type="submit"
                              disabled={isLoading}
                              className="w-full h-12 bg-white hover:bg-slate-100 text-[#020617] font-bold rounded-xl transition-all shadow-lg disabled:opacity-50"
                            >
                              {isLoading ? 'Analizando...' : 'Iniciar Análisis Operativo'}
                            </button>
                            <p className="text-[10px] text-center text-slate-500 italic mt-4">
                              Privacidad garantizada. El personal cognitivo anonimiza tus datos.
                            </p>
                          </form>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        ) : (
          <div className="py-20 animate-in fade-in slide-in-from-bottom-5 duration-700">
            <LeakCalculator />
          </div>
        )}
      </main>

      {/* Footer Minimalista */}
      <footer className="py-12 px-6 border-t border-slate-900 bg-[#020617] relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:row items-center justify-between gap-6 text-slate-500 text-[11px] font-bold uppercase tracking-[0.2em]">
          <div className="flex items-center gap-2">
            <span className="text-white">FLASH CLINIC</span>
            <span className="opacity-30">|</span>
            <span>INFRAESTRUCTURA PARA CLÍNICAS AAA</span>
          </div>
          <p>© 2026 Reservados todos los activos cognitivos.</p>
        </div>
      </footer>
    </div>
  )
}

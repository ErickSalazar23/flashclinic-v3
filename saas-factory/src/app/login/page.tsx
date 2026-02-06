'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<'login' | 'magic'>('login')
  const [magicLinkSent, setMagicLinkSent] = useState(false)

  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    startTransition(async () => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        setError(error.message)
        return
      }

      router.push('/dashboard')
      router.refresh()
    })
  }

  const handleMagicLink = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string

    startTransition(async () => {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        setError(error.message)
        return
      }

      setMagicLinkSent(true)
    })
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white">Flash Clinic</h1>
          <p className="text-slate-400 mt-2">Motor de Adquisición Médica</p>
        </div>

        {/* Card */}
        <div className="card">
          {magicLinkSent ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Revisa tu correo</h2>
              <p className="text-slate-400 text-sm">
                Hemos enviado un enlace mágico a tu email. Haz click en él para iniciar sesión.
              </p>
              <button
                onClick={() => setMagicLinkSent(false)}
                className="mt-6 text-sm text-blue-400 hover:text-blue-300"
              >
                Volver a intentar
              </button>
            </div>
          ) : (
            <>
              {/* Mode Toggle */}
              <div className="flex rounded-lg bg-slate-800 p-1 mb-6">
                <button
                  onClick={() => setMode('login')}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                    mode === 'login'
                      ? 'bg-slate-700 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Contraseña
                </button>
                <button
                  onClick={() => setMode('magic')}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                    mode === 'magic'
                      ? 'bg-slate-700 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Magic Link
                </button>
              </div>

              {error && (
                <div className="rounded-md bg-red-500/10 border border-red-500/20 p-3 mb-4">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {mode === 'login' ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="label">Email</label>
                    <input
                      type="email"
                      name="email"
                      required
                      className="input"
                      placeholder="tu@email.com"
                    />
                  </div>

                  <div>
                    <label className="label">Contraseña</label>
                    <input
                      type="password"
                      name="password"
                      required
                      className="input"
                      placeholder="••••••••"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isPending}
                    className="btn btn-primary w-full"
                  >
                    {isPending ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleMagicLink} className="space-y-4">
                  <div>
                    <label className="label">Email</label>
                    <input
                      type="email"
                      name="email"
                      required
                      className="input"
                      placeholder="tu@email.com"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isPending}
                    className="btn btn-primary w-full"
                  >
                    {isPending ? 'Enviando...' : 'Enviar Magic Link'}
                  </button>
                </form>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6 space-y-3">
          <p className="text-slate-400 text-sm">
            ¿No tienes cuenta?{' '}
            <Link href="/signup" className="text-blue-400 hover:text-blue-300 font-medium">
              Crear una aquí
            </Link>
          </p>
          <p className="text-center text-slate-500 text-sm">
            Flash Clinic V3 - Motor de Adquisición Médica
          </p>
        </div>
      </div>
    </div>
  )
}

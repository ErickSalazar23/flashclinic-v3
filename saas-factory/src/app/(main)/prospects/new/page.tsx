'use client'

import { ProspectForm } from '@/features/prospects/components'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewProspectPage() {
  const router = useRouter()

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-4">
        <Link
          href="/prospects"
          className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-white">Nuevo Prospecto</h2>
          <p className="mt-1 text-sm text-slate-400">
            Ingresa los datos del nuevo prospecto para análisis diagnóstico
          </p>
        </div>
      </div>

      {/* Form */}
      <ProspectForm
        onSuccess={() => router.push('/prospects')}
        onCancel={() => router.back()}
      />
    </div>
  )
}

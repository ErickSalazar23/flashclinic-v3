import { Suspense } from 'react'
import { listProspects } from '@/actions/prospects'
import { PipelineBoard, ProspectForm } from '@/features/prospects/components'
import { PageLoading, EmptyState } from '@/shared/components'
import Link from 'next/link'

async function ProspectsList() {
  const result = await listProspects()

  if (!result.ok) {
    return (
      <div className="rounded-md bg-red-500/10 border border-red-500/20 p-4">
        <p className="text-sm text-red-400">Error al cargar prospectos: {result.error}</p>
      </div>
    )
  }

  const prospects = result.data

  if (prospects.length === 0) {
    return (
      <EmptyState
        title="Sin prospectos"
        description="Comienza agregando tu primer prospecto al pipeline."
        icon={
          <svg className="h-12 w-12 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        }
        action={
          <Link href="/prospects/new" className="btn btn-primary">
            Agregar Prospecto
          </Link>
        }
      />
    )
  }

  return <PipelineBoard prospects={prospects} />
}

export default function ProspectsPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Pipeline de Prospectos</h2>
          <p className="mt-1 text-sm text-slate-400">
            Gestiona el ciclo de vida de tus prospectos médicos
          </p>
        </div>
        <Link href="/prospects/new" className="btn btn-primary">
          + Nuevo Prospecto
        </Link>
      </div>

      {/* Pipeline */}
      <Suspense fallback={<PageLoading message="Cargando pipeline..." />}>
        <ProspectsList />
      </Suspense>
    </div>
  )
}

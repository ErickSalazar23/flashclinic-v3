import { Suspense } from 'react'
import { listDecisions } from '@/actions/decisions'
import { PageLoading, EmptyState } from '@/shared/components'
import { DecisionsPageClient } from '@/features/decisions/components'

export const dynamic = 'force-dynamic'

// ============================================
// Pendientes Page (antes "Decisions")
// ============================================

async function PendientesList() {
  const result = await listDecisions({ status: 'PENDING' })

  if (!result.ok) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <p className="text-sm text-red-700">Error al cargar pendientes: {result.error}</p>
      </div>
    )
  }

  const decisions = result.data

  if (decisions.length === 0) {
    return (
      <EmptyState
        title="¡Todo al día!"
        description="No tienes pendientes que requieran tu atención. Los nuevos items aparecerán aquí cuando necesiten revisión."
        icon={
          <svg className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />
    )
  }

  return <DecisionsPageClient decisions={decisions} />
}

export default function PendientesPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Pendientes</h2>
          <p className="mt-1 text-sm text-gray-500">
            Items que requieren tu revisión o aprobación
          </p>
        </div>
      </div>

      {/* Lista de pendientes */}
      <Suspense fallback={<PageLoading message="Cargando pendientes..." />}>
        <PendientesList />
      </Suspense>
    </div>
  )
}

import { Suspense } from 'react'
import { DashboardOverview } from '@/features/dashboard/components'
import { PageLoading } from '@/shared/components'

export default function DashboardPage() {
  return (
    <Suspense fallback={<PageLoading message="Loading dashboard..." />}>
      <DashboardOverview />
    </Suspense>
  )
}

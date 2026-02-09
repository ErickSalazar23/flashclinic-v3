import { Sidebar } from '@/shared/components'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Flash Clinic V3',
  description: 'Motor de Adquisición Médica',
}

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-950">
      <Sidebar />
      <main className="pl-64">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}

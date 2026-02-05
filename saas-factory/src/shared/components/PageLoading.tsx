'use client'

interface PageLoadingProps {
  message?: string
}

export function PageLoading({ message = 'Cargando...' }: PageLoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-slate-700 rounded-full"></div>
        <div className="absolute top-0 left-0 w-12 h-12 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
      </div>
      <p className="text-slate-400 text-sm">{message}</p>
    </div>
  )
}

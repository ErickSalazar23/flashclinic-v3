import { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  description: string
  icon?: ReactNode
  action?: ReactNode
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] text-center px-4">
      {icon && (
        <div className="mb-4 text-slate-500">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-slate-400 text-sm max-w-md mb-6">{description}</p>
      {action && action}
    </div>
  )
}

import type { ReactNode } from 'react'
import { TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react'

// ============================================
// Stats Card Component
// ============================================

type ColorVariant = 'default' | 'success' | 'warning' | 'danger' | 'info'

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon?: ReactNode
  IconComponent?: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  color?: ColorVariant
}

const colorConfig: Record<ColorVariant, { icon: string; text: string; bg: string }> = {
  default: {
    icon: 'text-surface-400',
    text: 'text-white',
    bg: 'bg-surface-800',
  },
  success: {
    icon: 'text-green-500',
    text: 'text-green-500',
    bg: 'bg-green-500/10',
  },
  warning: {
    icon: 'text-flash-500',
    text: 'text-flash-500',
    bg: 'bg-flash-500/10',
  },
  danger: {
    icon: 'text-red-500',
    text: 'text-red-500',
    bg: 'bg-red-500/10',
  },
  info: {
    icon: 'text-blue-500',
    text: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
}

export function StatsCard({
  title,
  value,
  description,
  icon,
  IconComponent,
  trend,
  color = 'default',
}: StatsCardProps) {
  const colors = colorConfig[color]

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-surface-800 bg-surface-900/40 p-5 transition-all hover:border-surface-700 hover:bg-surface-900/60">
      {/* Header with icon */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-surface-500 mb-2">
            {IconComponent && <IconComponent className={`w-4 h-4 ${colors.icon}`} />}
            <span className="text-xs font-bold uppercase tracking-wider">{title}</span>
          </div>
          <div className={`text-2xl font-black ${color === 'default' ? 'text-white' : colors.text}`}>
            {value}
            {trend && (
              <span
                className={`ml-2 text-xs font-medium ${
                  trend.isPositive ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {trend.isPositive ? '+' : ''}
                {trend.value}%
              </span>
            )}
          </div>
          {description && (
            <p className="mt-1 text-xs text-surface-500">{description}</p>
          )}
        </div>

        {/* Legacy icon support */}
        {icon && !IconComponent && (
          <div className={`rounded-xl ${colors.bg} p-3 ${colors.icon}`}>
            {icon}
          </div>
        )}
      </div>

      {/* Trend indicator */}
      {trend && (
        <div
          className={`mt-3 flex items-center gap-1 text-xs font-medium ${
            trend.isPositive ? 'text-green-500' : 'text-red-500'
          }`}
        >
          {trend.isPositive ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          <span>vs. mes anterior</span>
        </div>
      )}

      {/* Decorative gradient */}
      <div
        className={`absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-20 blur-2xl transition-opacity group-hover:opacity-30 ${
          color === 'danger'
            ? 'bg-red-500'
            : color === 'warning'
              ? 'bg-flash-500'
              : color === 'success'
                ? 'bg-green-500'
                : color === 'info'
                  ? 'bg-blue-500'
                  : 'bg-surface-600'
        }`}
      />
    </div>
  )
}

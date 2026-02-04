'use client'

import {
  MessageCircle,
  Clock,
  User,
  Activity,
  Bell,
  Calendar,
  ChevronRight,
  Phone,
  type LucideIcon,
} from 'lucide-react'

// ============================================
// Action Card Component - AI Suggested Actions
// ============================================

type ActionType = 'confirmacion' | 'reprogramar' | 'seguimiento' | 'no_show' | 'recordatorio'
type Priority = 'alta' | 'media' | 'baja'

interface ActionCardProps {
  id: string | number
  tipo: ActionType
  paciente: string
  descripcion: string
  prioridad: Priority
  fecha?: string
  hora?: string
  onAction?: () => void
  onSecondaryAction?: () => void
}

const actionIcons: Record<ActionType, LucideIcon> = {
  confirmacion: MessageCircle,
  reprogramar: Clock,
  no_show: User,
  seguimiento: Activity,
  recordatorio: Bell,
}

const priorityColors: Record<Priority, string> = {
  alta: 'from-red-950/40 to-surface-900',
  media: 'from-amber-950/40 to-surface-900',
  baja: 'from-blue-950/40 to-surface-900',
}

const priorityIconColors: Record<Priority, string> = {
  alta: 'text-red-500',
  media: 'text-flash-500',
  baja: 'text-blue-500',
}

export function ActionCard({
  tipo,
  paciente,
  descripcion,
  prioridad,
  fecha,
  hora,
  onAction,
  onSecondaryAction,
}: ActionCardProps) {
  const Icon = actionIcons[tipo]

  return (
    <div
      className={`group relative overflow-hidden bg-gradient-to-r ${priorityColors[prioridad]} border border-surface-800 rounded-2xl p-5 hover:border-flash-500/50 transition-all duration-300 shadow-xl`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left side - Icon and info */}
        <div className="flex items-start gap-4">
          <div
            className={`p-3 rounded-xl bg-surface-950 border border-surface-800 ${priorityIconColors[prioridad]}`}
          >
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg flex items-center gap-2">
              {paciente}
              {prioridad === 'alta' && (
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              )}
            </h3>
            <p className="text-surface-400 text-sm italic line-clamp-1">
              &quot;{descripcion}&quot;
            </p>
            {(fecha || hora) && (
              <div className="flex gap-4 mt-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-surface-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {fecha} {hora}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onAction}
            className="bg-green-600 hover:bg-green-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-green-900/20 transition-all active:scale-95"
          >
            <Phone className="w-4 h-4 fill-current" />
            WhatsApp
          </button>
          <button
            onClick={onSecondaryAction}
            className="bg-surface-800 hover:bg-surface-700 p-2.5 rounded-xl border border-surface-700 transition-all"
          >
            <ChevronRight className="w-4 h-4 text-surface-400" />
          </button>
        </div>
      </div>
    </div>
  )
}

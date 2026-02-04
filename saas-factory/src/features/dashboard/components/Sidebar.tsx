'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  CheckCircle2,
  Zap,
  Settings,
  type LucideIcon,
} from 'lucide-react'

// ============================================
// Sidebar Navigation Component
// ============================================

interface NavItem {
  name: string
  href: string
  icon: LucideIcon
  badge?: number
}

const navigation: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Pacientes',
    href: '/patients',
    icon: Users,
  },
  {
    name: 'Citas',
    href: '/appointments',
    icon: CalendarDays,
  },
  {
    name: 'Decisiones',
    href: '/decisions',
    icon: CheckCircle2,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-surface-950 border-r border-surface-800">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center gap-2 px-6 border-b border-surface-800">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-flash-500">
          <Zap className="h-5 w-5 text-surface-950 fill-current" />
        </div>
        <div>
          <h1 className="text-lg font-black tracking-tight text-white">
            Flash<span className="text-flash-500">Clinic</span>
          </h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col px-3 py-4">
        <div className="mb-2 px-3">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-surface-500">
            Principal
          </span>
        </div>
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            const Icon = item.icon
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-flash-500/10 text-flash-500 shadow-sm shadow-flash-500/5'
                      : 'text-surface-400 hover:bg-surface-800/50 hover:text-surface-200'
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 transition-colors ${
                      isActive ? 'text-flash-500' : 'text-surface-500 group-hover:text-surface-300'
                    }`}
                  />
                  {item.name}
                  {item.badge && item.badge > 0 && (
                    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500/20 px-1.5 text-[10px] font-bold text-red-400">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>

        {/* Bottom section */}
        <div className="mt-auto pt-4 border-t border-surface-800">
          <Link
            href="/settings"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-surface-400 hover:bg-surface-800/50 hover:text-surface-200 transition-all"
          >
            <Settings className="h-5 w-5 text-surface-500" />
            Configuración
          </Link>
        </div>
      </nav>

      {/* Branding footer */}
      <div className="px-4 py-4 border-t border-surface-800">
        <div className="rounded-xl bg-surface-900/50 p-3">
          <p className="text-[10px] font-medium text-surface-500">
            Powered by
          </p>
          <p className="text-xs font-semibold text-surface-300">
            Agencia Flash
          </p>
        </div>
      </div>
    </div>
  )
}

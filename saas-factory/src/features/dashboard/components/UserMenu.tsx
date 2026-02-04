'use client'

import { logout } from '@/actions/auth'
import { LogOut, ChevronDown } from 'lucide-react'

// ============================================
// User Menu Component
// ============================================

interface UserMenuProps {
  user: {
    email: string | null
    fullName: string | null
  }
}

export function UserMenu({ user }: UserMenuProps) {
  const displayName = user.fullName || user.email || 'Usuario'
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const handleLogout = async () => {
    await logout()
  }

  return (
    <div className="flex items-center gap-3">
      {/* User info */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-flash-500/20 text-sm font-bold text-flash-500 border border-flash-500/30">
          {initials}
        </div>
        <div className="hidden sm:block">
          <p className="text-sm font-semibold text-surface-200">{displayName}</p>
          {user.fullName && user.email && (
            <p className="text-xs text-surface-500">{user.email}</p>
          )}
        </div>
        <ChevronDown className="h-4 w-4 text-surface-500 hidden sm:block" />
      </div>

      {/* Logout button */}
      <form action={handleLogout}>
        <button
          type="submit"
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-surface-400 hover:bg-surface-800 hover:text-red-400 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Salir</span>
        </button>
      </form>
    </div>
  )
}

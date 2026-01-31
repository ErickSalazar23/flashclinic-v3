'use client'

import { logout } from '@/actions/auth'

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
  const displayName = user.fullName || user.email || 'User'
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
    <div className="flex items-center gap-4">
      {/* User info */}
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-medium text-white">
          {initials}
        </div>
        <div className="hidden sm:block">
          <p className="text-sm font-medium text-gray-900">{displayName}</p>
          {user.fullName && user.email && (
            <p className="text-xs text-gray-500">{user.email}</p>
          )}
        </div>
      </div>

      {/* Logout button */}
      <form action={handleLogout}>
        <button
          type="submit"
          className="rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        >
          Logout
        </button>
      </form>
    </div>
  )
}

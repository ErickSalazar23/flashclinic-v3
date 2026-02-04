import { getSession } from '@/actions/auth'
import { UserMenu } from './UserMenu'
import { Bell, Search } from 'lucide-react'

// ============================================
// Header Component
// ============================================

export async function Header() {
  const session = await getSession()

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-surface-800 bg-surface-950 px-6">
      {/* Search bar */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-500" />
          <input
            type="text"
            placeholder="Buscar pacientes, citas..."
            className="w-full rounded-xl border border-surface-800 bg-surface-900 py-2 pl-10 pr-4 text-sm text-surface-200 placeholder:text-surface-500 focus:border-flash-500 focus:outline-none focus:ring-1 focus:ring-flash-500/20"
          />
        </div>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative rounded-xl p-2 text-surface-400 hover:bg-surface-800 hover:text-surface-200 transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
        </button>

        {/* User menu */}
        {session.isAuthenticated && session.user && (
          <UserMenu user={session.user} />
        )}
      </div>
    </header>
  )
}

import { getSession } from '@/actions/auth'
import { UserMenu } from './UserMenu'

// ============================================
// Header Component
// ============================================

export async function Header() {
  const session = await getSession()

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6">
      {/* Page title area - can be customized per page */}
      <div>
        <h1 className="text-lg font-semibold text-gray-900">FlashClinic</h1>
      </div>

      {/* User menu */}
      {session.isAuthenticated && session.user && (
        <UserMenu user={session.user} />
      )}
    </header>
  )
}

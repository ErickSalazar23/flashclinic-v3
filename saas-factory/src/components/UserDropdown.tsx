'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()

        if (user?.email) {
          setUserEmail(user.email)
        } else {
          // Fallback to landing if no user
          router.push('/landing')
        }
      } catch (error) {
        console.error('Error fetching user:', error)
      } finally {
        setIsLoading(false)
      }
    }

    getUser()
  }, [supabase.auth, router])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleLogout = async () => {
    setIsSigningOut(true)
    try {
      await supabase.auth.signOut()
      router.push('/landing')
    } catch (error) {
      console.error('Error signing out:', error)
      setIsSigningOut(false)
    }
  }

  // Get initials from email
  const getInitials = (email: string | null): string => {
    if (!email) return '?'
    const name = email.split('@')[0]
    const parts = name.split('.')
    return parts.map(p => p[0]).join('').toUpperCase().slice(0, 2)
  }

  if (isLoading) {
    return (
      <div className="w-10 h-10 rounded-full bg-slate-700/50 animate-pulse"></div>
    )
  }

  return (
    <div ref={dropdownRef} className="relative">
      {/* User Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/30 to-blue-600/30 hover:from-cyan-500/50 hover:to-blue-600/50 border border-cyan-500/40 hover:border-cyan-500/70 flex items-center justify-center text-sm font-bold text-cyan-400 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20"
        title={userEmail || 'User'}
      >
        {getInitials(userEmail)}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-56 bg-slate-900/95 border border-slate-700/50 rounded-xl shadow-2xl shadow-slate-900/50 overflow-hidden backdrop-blur-xl z-50 animate-in fade-in duration-200">
          {/* User Info Section */}
          <div className="px-4 py-3 border-b border-slate-700/30">
            <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Cuenta</p>
            <p className="text-sm text-white font-medium truncate">{userEmail}</p>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            disabled={isSigningOut}
            className="w-full px-4 py-3 text-left text-sm font-semibold text-slate-200 hover:text-white bg-red-950/0 hover:bg-red-950/40 border-t border-slate-700/30 hover:border-red-500/40 transition-all duration-300 flex items-center gap-2 group relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {/* Neon red glow background on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute -inset-1 bg-red-500/20 rounded blur-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>

            <span className="relative z-10">
              {isSigningOut ? '⏳ Cerrando sesión...' : '🚪 Cerrar Sesión'}
            </span>
          </button>
        </div>
      )}
    </div>
  )
}

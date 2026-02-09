'use client'

import { useState } from 'react'
import { useActionState } from 'react'
import Link from 'next/link'
import { sendMagicLink, type SendMagicLinkResult } from '@/actions/auth'

// ============================================
// Login Form Component
// ============================================

// const loginInitialState: LoginResult | null = null
const magicLinkInitialState: SendMagicLinkResult | null = null

export function LoginForm() {
  // const [loginState, loginAction, isLoginPending] = useActionState(login, loginInitialState)
  const [magicLinkState, magicLinkAction, isMagicLinkPending] = useActionState(sendMagicLink, magicLinkInitialState)
  const [showPassword, setShowPassword] = useState(false)
  // Simplificación: Solo Magic Link
  return (
    <form action={magicLinkAction} className="space-y-6">
      {/* Success Message */}
      {magicLinkState?.ok && (
        <div className="rounded-md bg-green-50 p-4 border border-green-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{magicLinkState.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {magicLinkState && magicLinkState.ok === false && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-700">{magicLinkState.error}</p>
        </div>
      )}

      {/* Email Field */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          disabled={isMagicLinkPending}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isMagicLinkPending}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isMagicLinkPending ? 'Sending link...' : 'Send magic link'}
      </button>

      {/* Signup Link */}
      <p className="text-center text-sm text-gray-600">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
          Sign up
        </Link>
      </p>
    </form>
  )
}

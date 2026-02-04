'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { forgotPassword, type ForgotPasswordResult } from '@/actions/auth'

// ============================================
// Forgot Password Form Component
// ============================================

const initialState: ForgotPasswordResult | null = null

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(forgotPassword, initialState)

  return (
    <form action={formAction} className="space-y-6">
      {/* Success Message */}
      {state && state.ok && (
        <div className="rounded-md bg-green-50 p-4">
          <p className="text-sm text-green-700">{state.message}</p>
        </div>
      )}

      {/* Error Message */}
      {state && !state.ok && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-700">{state.error}</p>
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
          disabled={isPending}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        <p className="mt-2 text-sm text-gray-500">
          Enter your email and we&apos;ll send you a link to reset your password.
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? 'Sending...' : 'Send reset link'}
      </button>

      {/* Back to Login Link */}
      <p className="text-center text-sm text-gray-600">
        Remember your password?{' '}
        <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
          Back to login
        </Link>
      </p>
    </form>
  )
}

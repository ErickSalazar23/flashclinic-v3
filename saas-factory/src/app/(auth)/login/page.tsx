import { LoginForm } from '@/features/auth/components'

interface LoginPageProps {
  searchParams: Promise<{ message?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { message } = await searchParams

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="mt-2 text-sm text-gray-600">Sign in to your account</p>
        </div>
        {message === 'password-reset' && (
          <div className="rounded-md bg-green-50 p-4">
            <p className="text-sm text-green-700">
              Your password has been reset successfully. You can now sign in with your new password.
            </p>
          </div>
        )}
        <LoginForm />
      </div>
    </div>
  )
}

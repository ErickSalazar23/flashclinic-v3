'use client'

import { Component, type ReactNode, type ErrorInfo } from 'react'

// ============================================
// Error Boundary Component
// ============================================

interface ErrorBoundaryProps {
  children: ReactNode
  /** Custom fallback UI to show when error occurs */
  fallback?: ReactNode
  /** Called when an error is caught */
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  /** Feature name for error reporting */
  featureName?: string
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

/**
 * React Error Boundary for graceful error handling.
 *
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI.
 *
 * @example
 * ```tsx
 * <ErrorBoundary featureName="appointments">
 *   <AppointmentList />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo })

    // Log error to console
    console.error(`[ErrorBoundary${this.props.featureName ? `: ${this.props.featureName}` : ''}]`, error)
    console.error('Component stack:', errorInfo.componentStack)

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default fallback UI
      return (
        <ErrorFallback
          error={this.state.error}
          featureName={this.props.featureName}
          onReset={this.handleReset}
        />
      )
    }

    return this.props.children
  }
}

// ============================================
// Default Error Fallback UI
// ============================================

interface ErrorFallbackProps {
  error: Error | null
  featureName?: string
  onReset?: () => void
}

export function ErrorFallback({ error, featureName, onReset }: ErrorFallbackProps) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6">
      <div className="flex items-start gap-3">
        {/* Error Icon */}
        <div className="flex-shrink-0">
          <svg
            className="h-6 w-6 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Error Content */}
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-800">
            {featureName ? `Error in ${featureName}` : 'Something went wrong'}
          </h3>
          <p className="mt-1 text-sm text-red-700">
            {error?.message || 'An unexpected error occurred. Please try again.'}
          </p>

          {/* Actions */}
          <div className="mt-4 flex gap-3">
            {onReset && (
              <button
                onClick={onReset}
                className="inline-flex items-center rounded-md bg-red-100 px-3 py-2 text-sm font-medium text-red-800 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Try again
              </button>
            )}
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Reload page
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================
// Inline Error Display (for smaller contexts)
// ============================================

interface InlineErrorProps {
  message: string
  onRetry?: () => void
}

export function InlineError({ message, onRetry }: InlineErrorProps) {
  return (
    <div className="flex items-center gap-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
      <svg
        className="h-4 w-4 flex-shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span>{message}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="ml-auto text-red-800 underline hover:no-underline"
        >
          Retry
        </button>
      )}
    </div>
  )
}

// ============================================
// Feature-Specific Error Boundaries
// ============================================

interface FeatureErrorBoundaryProps {
  children: ReactNode
  featureName: string
}

export function AppointmentsErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary featureName="Appointments">
      {children}
    </ErrorBoundary>
  )
}

export function PatientsErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary featureName="Patients">
      {children}
    </ErrorBoundary>
  )
}

export function DecisionsErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary featureName="Decisions">
      {children}
    </ErrorBoundary>
  )
}

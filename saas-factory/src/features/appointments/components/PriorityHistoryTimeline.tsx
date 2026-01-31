'use client'

import type { PriorityHistoryEntry } from '../types'
import { formatPriority, getPriorityColorClass, formatPriorityOrigin } from '../types'

// ============================================
// Priority History Timeline Component
// ============================================

interface PriorityHistoryTimelineProps {
  history: PriorityHistoryEntry[]
  className?: string
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function PriorityHistoryTimeline({
  history,
  className = '',
}: PriorityHistoryTimelineProps) {
  if (history.length === 0) {
    return (
      <div className={`text-sm text-gray-500 ${className}`}>
        No priority history available.
      </div>
    )
  }

  // Reverse to show newest first
  const sortedHistory = [...history].reverse()

  return (
    <div className={`space-y-4 ${className}`}>
      <h4 className="text-sm font-medium text-gray-900">Priority History</h4>

      <div className="flow-root">
        <ul className="-mb-8">
          {sortedHistory.map((entry, index) => {
            const isLast = index === sortedHistory.length - 1
            const isHuman = entry.origin === 'HUMAN'

            return (
              <li key={entry.occurred_at}>
                <div className="relative pb-8">
                  {/* Connecting line */}
                  {!isLast && (
                    <span
                      className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                      aria-hidden="true"
                    />
                  )}

                  <div className="relative flex space-x-3">
                    {/* Icon */}
                    <div>
                      <span
                        className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                          isHuman
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-400 text-white'
                        }`}
                      >
                        {isHuman ? (
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                        )}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                      <div>
                        {/* Priority change */}
                        <div className="flex items-center gap-2">
                          {entry.previous_priority && (
                            <>
                              <span
                                className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColorClass(
                                  entry.previous_priority
                                )}`}
                              >
                                {formatPriority(entry.previous_priority)}
                              </span>
                              <span className="text-gray-400">→</span>
                            </>
                          )}
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColorClass(
                              entry.priority
                            )}`}
                          >
                            {formatPriority(entry.priority)}
                          </span>
                        </div>

                        {/* Origin badge */}
                        <div className="mt-1">
                          <span
                            className={`text-xs px-2 py-0.5 rounded ${
                              isHuman
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {formatPriorityOrigin(entry.origin)}
                          </span>
                        </div>

                        {/* Justification (for human overrides) */}
                        {entry.justification && (
                          <p className="mt-2 text-sm text-gray-600 italic">
                            &ldquo;{entry.justification}&rdquo;
                          </p>
                        )}
                      </div>

                      {/* Timestamp */}
                      <div className="whitespace-nowrap text-right text-xs text-gray-500">
                        {formatDateTime(entry.occurred_at)}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

// ============================================
// Priority History Summary Component
// ============================================

interface PriorityHistorySummaryProps {
  history: PriorityHistoryEntry[]
  className?: string
}

export function PriorityHistorySummary({
  history,
  className = '',
}: PriorityHistorySummaryProps) {
  const humanOverrides = history.filter((e) => e.origin === 'HUMAN').length
  const systemChanges = history.filter((e) => e.origin === 'SYSTEM').length
  const latestEntry = history.length > 0 ? history[history.length - 1] : null

  return (
    <div className={`flex items-center gap-4 text-sm ${className}`}>
      <div className="flex items-center gap-1">
        <span className="text-gray-500">Changes:</span>
        <span className="font-medium">{history.length}</span>
      </div>

      {humanOverrides > 0 && (
        <div className="flex items-center gap-1">
          <span className="text-blue-600">Manual:</span>
          <span className="font-medium text-blue-700">{humanOverrides}</span>
        </div>
      )}

      {systemChanges > 0 && (
        <div className="flex items-center gap-1">
          <span className="text-gray-500">System:</span>
          <span className="font-medium">{systemChanges}</span>
        </div>
      )}

      {latestEntry && latestEntry.origin === 'HUMAN' && (
        <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-xs">
          Currently Overridden
        </span>
      )}
    </div>
  )
}

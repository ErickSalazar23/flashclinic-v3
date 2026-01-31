import type { DomainEventHandler, DecisionResolvedEvent } from '@/features/events/types'

// ============================================
// On Decision Resolved Handler
// ============================================

/**
 * Callback for when a decision is resolved.
 */
export type OnDecisionResolvedCallback = (
  decisionId: string,
  resolution: 'APPROVED' | 'REJECTED',
  resolvedBy: string
) => Promise<void>

/**
 * Dependencies for the handler.
 */
export interface OnDecisionResolvedDeps {
  /**
   * Callback to execute downstream actions based on resolution.
   * E.g., if APPROVED, continue with the original action.
   */
  onApproved?: OnDecisionResolvedCallback

  /**
   * Callback for rejected decisions.
   * E.g., notify user, rollback, etc.
   */
  onRejected?: OnDecisionResolvedCallback

  /**
   * Optional logging service.
   */
  logger?: {
    info: (message: string, data?: Record<string, unknown>) => void
  }
}

/**
 * Creates a handler for DECISION_RESOLVED events.
 *
 * Responsibilities:
 * - Log decision resolution for audit
 * - Trigger downstream actions based on resolution
 * - Idempotent: Safe to process same event multiple times
 *
 * @param deps - Handler dependencies
 * @returns The event handler
 */
export function createOnDecisionResolvedHandler(
  deps: OnDecisionResolvedDeps = {}
): DomainEventHandler<DecisionResolvedEvent> {
  const { onApproved, onRejected, logger = console } = deps

  // Track processed events for idempotency
  const processedEvents = new Set<string>()

  return {
    eventType: 'DECISION_RESOLVED',

    async handle(event: DecisionResolvedEvent): Promise<void> {
      // Idempotency check
      if (processedEvents.has(event.id)) {
        logger.info?.(`[onDecisionResolved] Event ${event.id} already processed, skipping`)
        return
      }

      const { aggregate_id: decisionId, payload } = event
      const { resolved_by, resolution } = payload

      // Log for audit trail
      logger.info?.(`[onDecisionResolved] Decision resolved`, {
        decisionId,
        resolution,
        resolvedBy: resolved_by,
        timestamp: event.created_at,
      })

      // Execute downstream actions based on resolution
      try {
        if (resolution === 'APPROVED' && onApproved) {
          await onApproved(decisionId, resolution, resolved_by)
          logger.info?.(`[onDecisionResolved] Approved callback executed`)
        } else if (resolution === 'REJECTED' && onRejected) {
          await onRejected(decisionId, resolution, resolved_by)
          logger.info?.(`[onDecisionResolved] Rejected callback executed`)
        }
      } catch (error) {
        // Log but don't fail the handler
        logger.info?.(`[onDecisionResolved] Callback failed: ${error}`)
      }

      // Mark as processed
      processedEvents.add(event.id)

      // Cleanup old entries
      if (processedEvents.size > 1000) {
        const entries = Array.from(processedEvents)
        entries.slice(0, 500).forEach((id) => processedEvents.delete(id))
      }
    },
  }
}

/**
 * Default handler instance (no callbacks configured).
 */
export const onDecisionResolvedHandler = createOnDecisionResolvedHandler()

import type { DomainEventHandler, DecisionCreatedEvent } from '@/features/events/types'

// ============================================
// On Decision Created Handler
// ============================================

/**
 * Dependencies for the handler.
 */
export interface OnDecisionCreatedDeps {
  /**
   * Optional notification service for alerting operators.
   * Can be implemented later.
   */
  notifyOperator?: (decisionId: string, reason: string) => Promise<void>

  /**
   * Optional logging service.
   */
  logger?: {
    info: (message: string, data?: Record<string, unknown>) => void
  }
}

/**
 * Creates a handler for DECISION_CREATED events.
 *
 * Responsibilities:
 * - Log decision creation for audit
 * - Optionally notify operators
 * - Idempotent: Safe to process same event multiple times
 *
 * @param deps - Handler dependencies
 * @returns The event handler
 */
export function createOnDecisionCreatedHandler(
  deps: OnDecisionCreatedDeps = {}
): DomainEventHandler<DecisionCreatedEvent> {
  const { notifyOperator, logger = console } = deps

  // Track processed events for idempotency within this handler instance
  const processedEvents = new Set<string>()

  return {
    eventType: 'DECISION_CREATED',

    async handle(event: DecisionCreatedEvent): Promise<void> {
      // Idempotency check
      if (processedEvents.has(event.id)) {
        logger.info?.(`[onDecisionCreated] Event ${event.id} already processed, skipping`)
        return
      }

      const { aggregate_id: decisionId, payload } = event
      const { reference_type, reference_id, weight, reason } = payload

      // Log for audit trail
      logger.info?.(`[onDecisionCreated] New pending decision created`, {
        decisionId,
        referenceType: reference_type,
        referenceId: reference_id,
        weight,
        reason,
        timestamp: event.created_at,
      })

      // Notify operator if configured
      if (notifyOperator && weight === 'HIGH') {
        try {
          await notifyOperator(decisionId, reason)
          logger.info?.(`[onDecisionCreated] Operator notified for HIGH weight decision`)
        } catch (error) {
          // Don't fail the handler if notification fails
          logger.info?.(`[onDecisionCreated] Failed to notify operator: ${error}`)
        }
      }

      // Mark as processed
      processedEvents.add(event.id)

      // Cleanup old entries to prevent memory leak (keep last 1000)
      if (processedEvents.size > 1000) {
        const entries = Array.from(processedEvents)
        entries.slice(0, 500).forEach((id) => processedEvents.delete(id))
      }
    },
  }
}

/**
 * Default handler instance.
 */
export const onDecisionCreatedHandler = createOnDecisionCreatedHandler()

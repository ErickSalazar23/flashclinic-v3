import type { DecisionRepositoryPort } from '../ports'
import type { EventPublisherPort, DecisionCreatedEvent } from '@/features/events/types'
import type { PendingDecision } from '../types'
import type { CreateDecisionRequest } from '../engine/types'

// ============================================
// Create Decision Service
// ============================================

/**
 * Result of the create decision operation.
 */
export type CreateDecisionResult =
  | { ok: true; decision: PendingDecision; created: true }
  | { ok: true; decision: PendingDecision; created: false; reason: 'already_exists' }
  | { ok: false; error: string }

/**
 * Dependencies for the create decision service.
 */
export interface CreateDecisionServiceDeps {
  repository: DecisionRepositoryPort
  eventPublisher: EventPublisherPort
}

/**
 * Creates a service for creating pending decisions.
 *
 * Features:
 * - Idempotent: Won't create duplicate decisions for same reference
 * - Event-driven: Emits DECISION_CREATED event on success
 * - Auditable: All decisions are tracked
 *
 * @param deps - Service dependencies (repository, event publisher)
 * @returns The create decision function
 */
export function createDecisionService(deps: CreateDecisionServiceDeps) {
  const { repository, eventPublisher } = deps

  /**
   * Creates a new pending decision.
   *
   * Idempotency: If an unresolved decision already exists for the same
   * reference, returns the existing decision without creating a new one.
   *
   * @param request - The decision creation request
   * @returns Result with the decision (new or existing)
   */
  return async function createDecision(
    request: CreateDecisionRequest
  ): Promise<CreateDecisionResult> {
    const { referenceType, referenceId, weight, reason } = request

    // Idempotency check: Look for existing unresolved decision
    const existing = await repository.findUnresolvedByReference(
      referenceType,
      referenceId
    )

    if (existing) {
      return {
        ok: true,
        decision: existing,
        created: false,
        reason: 'already_exists',
      }
    }

    // Create new decision
    try {
      const decision = await repository.create({
        reference_type: referenceType,
        reference_id: referenceId,
        weight,
        reason,
      })

      // Emit domain event
      const event: Omit<DecisionCreatedEvent, 'id' | 'created_at'> = {
        aggregate_type: 'PENDING_DECISION',
        aggregate_id: decision.id,
        event_type: 'DECISION_CREATED',
        payload: {
          reference_type: referenceType,
          reference_id: referenceId,
          weight,
          reason,
        },
      }

      await eventPublisher.publish(event)

      return {
        ok: true,
        decision,
        created: true,
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      return {
        ok: false,
        error: `Failed to create decision: ${message}`,
      }
    }
  }
}

/**
 * Type for the create decision function.
 */
export type CreateDecisionFn = ReturnType<typeof createDecisionService>

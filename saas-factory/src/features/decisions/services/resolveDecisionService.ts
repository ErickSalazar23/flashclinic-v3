import type { DecisionRepositoryPort } from '../ports'
import type { EventPublisherPort, DecisionResolvedEvent } from '@/features/events/types'
import type { PendingDecision } from '../types'
import type { ResolveDecisionRequest, ResolutionType } from '../engine/types'

// ============================================
// Resolve Decision Service
// ============================================

/**
 * Result of the resolve decision operation.
 */
export type ResolveDecisionResult =
  | { ok: true; decision: PendingDecision; resolution: ResolutionType }
  | { ok: false; error: string; code: 'NOT_FOUND' | 'ALREADY_RESOLVED' | 'INTERNAL_ERROR' }

/**
 * Dependencies for the resolve decision service.
 */
export interface ResolveDecisionServiceDeps {
  repository: DecisionRepositoryPort
  eventPublisher: EventPublisherPort
}

/**
 * Creates a service for resolving pending decisions.
 *
 * Features:
 * - Idempotent: Won't resolve already-resolved decisions
 * - Event-driven: Emits DECISION_RESOLVED event on success
 * - Auditable: Records who resolved and when
 *
 * @param deps - Service dependencies (repository, event publisher)
 * @returns The resolve decision function
 */
export function resolveDecisionService(deps: ResolveDecisionServiceDeps) {
  const { repository, eventPublisher } = deps

  /**
   * Resolves a pending decision.
   *
   * Idempotency: If decision is already resolved, returns error with code.
   *
   * @param request - The resolution request
   * @returns Result with the resolved decision
   */
  return async function resolveDecision(
    request: ResolveDecisionRequest
  ): Promise<ResolveDecisionResult> {
    const { decisionId, resolvedBy, resolution } = request

    // Find the decision
    const existing = await repository.findById(decisionId)

    if (!existing) {
      return {
        ok: false,
        error: `Decision ${decisionId} not found`,
        code: 'NOT_FOUND',
      }
    }

    // Idempotency check: Already resolved
    if (existing.resolved_at !== null) {
      return {
        ok: false,
        error: `Decision ${decisionId} was already resolved at ${existing.resolved_at}`,
        code: 'ALREADY_RESOLVED',
      }
    }

    // Resolve the decision
    try {
      const resolvedDecision = await repository.resolve(decisionId, resolvedBy)

      // Emit domain event
      const event: Omit<DecisionResolvedEvent, 'id' | 'created_at'> = {
        aggregate_type: 'PENDING_DECISION',
        aggregate_id: decisionId,
        event_type: 'DECISION_RESOLVED',
        payload: {
          resolved_by: resolvedBy,
          resolution,
        },
      }

      await eventPublisher.publish(event)

      return {
        ok: true,
        decision: resolvedDecision,
        resolution,
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      return {
        ok: false,
        error: `Failed to resolve decision: ${message}`,
        code: 'INTERNAL_ERROR',
      }
    }
  }
}

/**
 * Type for the resolve decision function.
 */
export type ResolveDecisionFn = ReturnType<typeof resolveDecisionService>

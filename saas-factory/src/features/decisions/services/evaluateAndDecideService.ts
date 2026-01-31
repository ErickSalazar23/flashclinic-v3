import type { DecisionRepositoryPort } from '../ports'
import type { EventPublisherPort } from '@/features/events/types'
import type { EvaluationContext, DecisionEngineOutput } from '../engine/types'
import type { PendingDecision } from '../types'
import { createDecisionEngine, type DecisionEngine } from '../engine/decisionEngine'
import { createDecisionService, type CreateDecisionResult } from './createDecisionService'

// ============================================
// Evaluate and Decide Service
// ============================================

/**
 * Result of the evaluate and decide operation.
 */
export type EvaluateAndDecideResult =
  | {
      ok: true
      requiresDecision: false
      output: DecisionEngineOutput
    }
  | {
      ok: true
      requiresDecision: true
      output: DecisionEngineOutput
      decisionResult: CreateDecisionResult
    }
  | {
      ok: false
      error: string
    }

/**
 * Dependencies for the evaluate and decide service.
 */
export interface EvaluateAndDecideServiceDeps {
  repository: DecisionRepositoryPort
  eventPublisher: EventPublisherPort
  engine?: DecisionEngine
}

/**
 * Creates a service that combines evaluation and decision creation.
 *
 * This is the main orchestration service that:
 * 1. Evaluates a context using the decision engine
 * 2. If decision is required, creates a pending decision
 * 3. Emits appropriate domain events
 *
 * @param deps - Service dependencies
 * @returns The evaluate and decide function
 */
export function evaluateAndDecideService(deps: EvaluateAndDecideServiceDeps) {
  const { repository, eventPublisher, engine = createDecisionEngine() } = deps

  const createDecision = createDecisionService({ repository, eventPublisher })

  /**
   * Evaluates a context and creates a decision if needed.
   *
   * @param context - The evaluation context
   * @returns Result with evaluation output and optional decision
   */
  return async function evaluateAndDecide(
    context: EvaluationContext
  ): Promise<EvaluateAndDecideResult> {
    try {
      // Step 1: Evaluate context with decision engine
      const output = engine.evaluate(context)

      // Step 2: Check if decision is required
      if (!engine.requiresHumanDecision(output)) {
        return {
          ok: true,
          requiresDecision: false,
          output,
        }
      }

      // Step 3: Create pending decision
      const decisionResult = await createDecision({
        referenceType: context.referenceType,
        referenceId: context.referenceId,
        weight: output.weight,
        reason: output.reasons.join(' | '),
      })

      return {
        ok: true,
        requiresDecision: true,
        output,
        decisionResult,
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      return {
        ok: false,
        error: `Evaluation failed: ${message}`,
      }
    }
  }
}

/**
 * Type for the evaluate and decide function.
 */
export type EvaluateAndDecideFn = ReturnType<typeof evaluateAndDecideService>

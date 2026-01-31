import type { PendingDecision, CreatePendingDecisionInput } from '../types'

// ============================================
// Decision Repository Port
// ============================================

/**
 * Query options for listing pending decisions.
 */
export interface ListPendingDecisionsQuery {
  /** Filter by reference type */
  referenceType?: string
  /** Filter by reference ID */
  referenceId?: string
  /** Filter by resolved status */
  resolved?: boolean
  /** Maximum number of results */
  limit?: number
  /** Offset for pagination */
  offset?: number
}

/**
 * Port for persisting and retrieving pending decisions.
 *
 * This is an interface that can be implemented by different adapters:
 * - Supabase adapter for production
 * - In-memory adapter for testing
 * - Mock adapter for unit tests
 */
export interface DecisionRepositoryPort {
  /**
   * Create a new pending decision.
   *
   * @param input - The decision data
   * @returns The created decision with generated ID and timestamp
   */
  create(input: CreatePendingDecisionInput): Promise<PendingDecision>

  /**
   * Find a pending decision by ID.
   *
   * @param id - The decision ID
   * @returns The decision or null if not found
   */
  findById(id: string): Promise<PendingDecision | null>

  /**
   * Find pending decisions by reference.
   *
   * @param referenceType - The reference type (e.g., 'APPOINTMENT')
   * @param referenceId - The reference entity ID
   * @returns Array of pending decisions for this reference
   */
  findByReference(referenceType: string, referenceId: string): Promise<PendingDecision[]>

  /**
   * Find unresolved decision for a reference (idempotency check).
   *
   * @param referenceType - The reference type
   * @param referenceId - The reference entity ID
   * @returns The unresolved decision or null
   */
  findUnresolvedByReference(
    referenceType: string,
    referenceId: string
  ): Promise<PendingDecision | null>

  /**
   * List pending decisions with optional filtering.
   *
   * @param query - Optional query parameters
   * @returns Array of pending decisions
   */
  list(query?: ListPendingDecisionsQuery): Promise<PendingDecision[]>

  /**
   * Resolve a pending decision.
   *
   * @param id - The decision ID
   * @param resolvedBy - The user ID who resolved it
   * @returns The updated decision
   */
  resolve(id: string, resolvedBy: string): Promise<PendingDecision>

  /**
   * Delete a pending decision (for cleanup/testing).
   *
   * @param id - The decision ID
   */
  delete(id: string): Promise<void>
}

'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { PendingDecision } from '@/features/decisions/types'

// ============================================
// Reject Decision Server Action
// ============================================

export type RejectDecisionResult =
  | { ok: true; decision: PendingDecision; alreadyRejected: false }
  | { ok: true; decision: PendingDecision; alreadyRejected: true }
  | { ok: false; error: string; code: 'NOT_FOUND' | 'ALREADY_APPROVED' | 'UNAUTHORIZED' | 'VALIDATION' | 'INTERNAL' }

/**
 * Rejects a pending decision.
 *
 * Idempotency:
 * - If already rejected: returns success with alreadyRejected: true
 * - If already approved: returns error with code ALREADY_APPROVED
 *
 * @param decisionId - The pending decision ID
 * @param reason - Required reason for rejection
 * @returns Result with updated decision
 */
export async function rejectDecision(
  decisionId: string,
  reason: string
): Promise<RejectDecisionResult> {
  // 1. Validate reason
  if (!reason || reason.trim().length < 5) {
    return {
      ok: false,
      error: 'Rejection reason must be at least 5 characters',
      code: 'VALIDATION',
    }
  }

  // 2. Auth check
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      ok: false,
      error: 'Authentication required',
      code: 'UNAUTHORIZED',
    }
  }

  // 3. Get the pending decision
  const { data: decision, error: fetchError } = await supabase
    .from('pending_decisions')
    .select('*')
    .eq('id', decisionId)
    .single()

  if (fetchError || !decision) {
    return {
      ok: false,
      error: 'Decision not found',
      code: 'NOT_FOUND',
    }
  }

  // 4. Idempotency check
  if (decision.resolved_at !== null) {
    if (decision.resolution_type === 'REJECTED') {
      // Already rejected - idempotent success
      return {
        ok: true,
        decision: decision as PendingDecision,
        alreadyRejected: true,
      }
    } else {
      // Already approved - cannot reject
      return {
        ok: false,
        error: 'Decision was already approved and cannot be rejected',
        code: 'ALREADY_APPROVED',
      }
    }
  }

  // 5. Update the decision as rejected
  const { data: updatedDecision, error: updateError } = await supabase
    .from('pending_decisions')
    .update({
      resolved_at: new Date().toISOString(),
      resolved_by: user.id,
      resolution_type: 'REJECTED',
      resolution_notes: reason.trim(),
    })
    .eq('id', decisionId)
    .select()
    .single()

  if (updateError) {
    console.error('[rejectDecision] Failed to update decision:', updateError)
    return {
      ok: false,
      error: 'Failed to reject decision',
      code: 'INTERNAL',
    }
  }

  // 6. Emit domain event
  await supabase.from('domain_events').insert({
    aggregate_type: 'PENDING_DECISION',
    aggregate_id: decisionId,
    event_type: 'DECISION_REJECTED',
    payload: {
      resolved_by: user.id,
      resolution_notes: reason.trim(),
      reference_type: decision.reference_type,
      reference_id: decision.reference_id,
    },
  })

  revalidatePath('/decisions')

  return {
    ok: true,
    decision: updatedDecision as PendingDecision,
    alreadyRejected: false,
  }
}

// Decision Handlers - Exports
export * from './onDecisionCreated'
export * from './onDecisionResolved'

import type { DomainEventHandler, TypedDomainEvent } from '@/features/events/types'
import { onDecisionCreatedHandler } from './onDecisionCreated'
import { onDecisionResolvedHandler } from './onDecisionResolved'

/**
 * All decision-related event handlers.
 */
export const decisionHandlers: DomainEventHandler<TypedDomainEvent>[] = [
  onDecisionCreatedHandler as DomainEventHandler<TypedDomainEvent>,
  onDecisionResolvedHandler as DomainEventHandler<TypedDomainEvent>,
]

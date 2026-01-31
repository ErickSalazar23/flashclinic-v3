import type {
  EventDispatcher,
  DomainEventHandler,
  TypedDomainEvent,
  EventType,
} from '../types'

// ============================================
// In-Memory Event Dispatcher
// ============================================

/**
 * In-memory event dispatcher with handler registry.
 *
 * Design principles:
 * - Decoupled: Handlers are registered separately from event publishing
 * - Extensible: New handlers can be added without modifying existing code
 * - Async: All handlers are async and run independently
 * - No side effects in domain: Domain logic publishes events, dispatcher handles side effects
 */
export class InMemoryEventDispatcher implements EventDispatcher {
  private handlers: Map<EventType, DomainEventHandler<TypedDomainEvent>[]> = new Map()

  /**
   * Register an event handler for a specific event type
   */
  register<TEvent extends TypedDomainEvent>(
    handler: DomainEventHandler<TEvent>
  ): void {
    const eventType = handler.eventType as EventType
    const existing = this.handlers.get(eventType) || []
    existing.push(handler as DomainEventHandler<TypedDomainEvent>)
    this.handlers.set(eventType, existing)
  }

  /**
   * Dispatch an event to all registered handlers
   * Handlers run concurrently and errors are logged but don't stop other handlers
   */
  async dispatch(event: TypedDomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.event_type) || []

    if (handlers.length === 0) {
      return
    }

    const results = await Promise.allSettled(
      handlers.map((handler) => handler.handle(event))
    )

    // Log any failed handlers (in production, you'd use proper logging)
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(
          `Handler ${index} failed for event ${event.event_type}:`,
          result.reason
        )
      }
    })
  }

  /**
   * Get the number of handlers registered for an event type
   * Useful for testing
   */
  getHandlerCount(eventType: EventType): number {
    return this.handlers.get(eventType)?.length || 0
  }

  /**
   * Clear all handlers (useful for testing)
   */
  clearHandlers(): void {
    this.handlers.clear()
  }
}

// ============================================
// Singleton Instance
// ============================================

let dispatcherInstance: InMemoryEventDispatcher | null = null

/**
 * Get singleton instance of the event dispatcher
 */
export function getEventDispatcher(): EventDispatcher {
  if (!dispatcherInstance) {
    dispatcherInstance = new InMemoryEventDispatcher()
  }
  return dispatcherInstance
}

/**
 * Get the internal dispatcher for testing purposes
 */
export function getInternalDispatcher(): InMemoryEventDispatcher {
  if (!dispatcherInstance) {
    dispatcherInstance = new InMemoryEventDispatcher()
  }
  return dispatcherInstance
}

// ============================================
// Handler Factory Helpers
// ============================================

/**
 * Create a typed event handler
 */
export function createHandler<TEvent extends TypedDomainEvent>(
  eventType: TEvent['event_type'],
  handleFn: (event: TEvent) => Promise<void>
): DomainEventHandler<TEvent> {
  return {
    eventType,
    handle: handleFn,
  }
}

// ============================================
// Dispatch Helper
// ============================================

/**
 * Dispatch an event using the singleton dispatcher
 */
export async function dispatchEvent(event: TypedDomainEvent): Promise<void> {
  const dispatcher = getEventDispatcher()
  await dispatcher.dispatch(event)
}

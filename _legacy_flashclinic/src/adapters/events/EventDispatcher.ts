import { DomainEvent } from "../../core/ports/PublicarEventoPort";
import { DomainEventHandler } from "./DomainEventHandler";

export class EventDispatcher {
  private readonly handlers: Map<string, DomainEventHandler[]> = new Map();

  register(handler: DomainEventHandler): void {
    const eventType = handler.eventType;
    const existing = this.handlers.get(eventType) || [];
    existing.push(handler);
    this.handlers.set(eventType, existing);
  }

  async dispatch(event: DomainEvent): Promise<void> {
    const eventType = event.constructor.name;
    const handlers = this.handlers.get(eventType) || [];

    for (const handler of handlers) {
      try {
        await handler.handle(event);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error(
          `[EventDispatcher] Error in handler for ${eventType}: ${errorMessage}`
        );
      }
    }
  }

  getRegisteredEventTypes(): string[] {
    return Array.from(this.handlers.keys());
  }
}

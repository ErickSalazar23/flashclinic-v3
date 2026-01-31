import { DomainEvent } from "../../core/ports/PublicarEventoPort";
import { DomainEventHandler } from "./DomainEventHandler";
export declare class EventDispatcher {
    private readonly handlers;
    register(handler: DomainEventHandler): void;
    dispatch(event: DomainEvent): Promise<void>;
    getRegisteredEventTypes(): string[];
}

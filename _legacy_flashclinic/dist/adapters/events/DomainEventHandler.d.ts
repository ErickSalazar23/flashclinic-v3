import { DomainEvent } from "../../core/ports/PublicarEventoPort";
export interface DomainEventHandler<T extends DomainEvent = DomainEvent> {
    readonly eventType: string;
    handle(event: T): Promise<void>;
}

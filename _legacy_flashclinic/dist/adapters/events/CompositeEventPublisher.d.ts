import { DomainEvent, PublicarEventoPort } from "../../core/ports/PublicarEventoPort";
import { EventDispatcher } from "./EventDispatcher";
export declare class CompositeEventPublisher implements PublicarEventoPort {
    private readonly persistencePublisher;
    private readonly dispatcher;
    constructor(persistencePublisher: PublicarEventoPort, dispatcher: EventDispatcher);
    publicar(evento: DomainEvent): Promise<void>;
}

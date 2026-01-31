import { DomainEvent, PublicarEventoPort } from "../../core/ports/PublicarEventoPort";
export declare class InMemoryEventPublisher implements PublicarEventoPort {
    private readonly eventos;
    publicar(evento: DomainEvent): Promise<void>;
    obtenerEventos(): DomainEvent[];
}

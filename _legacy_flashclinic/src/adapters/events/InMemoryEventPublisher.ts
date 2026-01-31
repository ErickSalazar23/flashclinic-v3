import {
  DomainEvent,
  PublicarEventoPort,
} from "../../core/ports/PublicarEventoPort";

export class InMemoryEventPublisher implements PublicarEventoPort {
  private readonly eventos: DomainEvent[] = [];

  async publicar(evento: DomainEvent): Promise<void> {
    this.eventos.push(evento);
  }

  obtenerEventos(): DomainEvent[] {
    return [...this.eventos];
  }
}

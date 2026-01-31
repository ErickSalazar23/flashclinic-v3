import {
  DomainEvent,
  PublicarEventoPort,
} from "../../core/ports/PublicarEventoPort";
import { EventDispatcher } from "./EventDispatcher";

export class CompositeEventPublisher implements PublicarEventoPort {
  constructor(
    private readonly persistencePublisher: PublicarEventoPort,
    private readonly dispatcher: EventDispatcher
  ) {}

  async publicar(evento: DomainEvent): Promise<void> {
    await this.persistencePublisher.publicar(evento);

    await this.dispatcher.dispatch(evento);
  }
}

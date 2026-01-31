// src/bootstrap.ts

import { SolicitarCitaUseCase } from "./core/use-cases/SolicitarCitaUseCase";
import { InMemoryEventPublisher } from "./adapters/events/InMemoryEventPublisher";
import { InMemoryPendingDecisionRepository } from "./adapters/database/InMemoryPendingDecisionRepository";
// import { WhatsAppEventPublisher } from "./adapters/whatsapp/WhatsAppEventPublisher";

export function bootstrap() {
  const eventPublisher = new InMemoryEventPublisher();
  const pendingDecisionRepository = new InMemoryPendingDecisionRepository();

  const solicitarCitaUseCase = new SolicitarCitaUseCase(
    eventPublisher,
    pendingDecisionRepository
  );

  return {
    solicitarCitaUseCase,
    eventPublisher,
    pendingDecisionRepository,
  };
}

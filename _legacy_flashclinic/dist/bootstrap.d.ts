import { SolicitarCitaUseCase } from "./core/use-cases/SolicitarCitaUseCase";
import { InMemoryEventPublisher } from "./adapters/events/InMemoryEventPublisher";
import { InMemoryPendingDecisionRepository } from "./adapters/database/InMemoryPendingDecisionRepository";
export declare function bootstrap(): {
    solicitarCitaUseCase: SolicitarCitaUseCase;
    eventPublisher: InMemoryEventPublisher;
    pendingDecisionRepository: InMemoryPendingDecisionRepository;
};

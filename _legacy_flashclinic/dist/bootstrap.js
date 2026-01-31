"use strict";
// src/bootstrap.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.bootstrap = bootstrap;
const SolicitarCitaUseCase_1 = require("./core/use-cases/SolicitarCitaUseCase");
const InMemoryEventPublisher_1 = require("./adapters/events/InMemoryEventPublisher");
const InMemoryPendingDecisionRepository_1 = require("./adapters/database/InMemoryPendingDecisionRepository");
// import { WhatsAppEventPublisher } from "./adapters/whatsapp/WhatsAppEventPublisher";
function bootstrap() {
    const eventPublisher = new InMemoryEventPublisher_1.InMemoryEventPublisher();
    const pendingDecisionRepository = new InMemoryPendingDecisionRepository_1.InMemoryPendingDecisionRepository();
    const solicitarCitaUseCase = new SolicitarCitaUseCase_1.SolicitarCitaUseCase(eventPublisher, pendingDecisionRepository);
    return {
        solicitarCitaUseCase,
        eventPublisher,
        pendingDecisionRepository,
    };
}

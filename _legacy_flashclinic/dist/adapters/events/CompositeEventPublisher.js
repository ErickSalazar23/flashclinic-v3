"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompositeEventPublisher = void 0;
class CompositeEventPublisher {
    constructor(persistencePublisher, dispatcher) {
        this.persistencePublisher = persistencePublisher;
        this.dispatcher = dispatcher;
    }
    async publicar(evento) {
        await this.persistencePublisher.publicar(evento);
        await this.dispatcher.dispatch(evento);
    }
}
exports.CompositeEventPublisher = CompositeEventPublisher;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryEventPublisher = void 0;
class InMemoryEventPublisher {
    constructor() {
        this.eventos = [];
    }
    async publicar(evento) {
        this.eventos.push(evento);
    }
    obtenerEventos() {
        return [...this.eventos];
    }
}
exports.InMemoryEventPublisher = InMemoryEventPublisher;

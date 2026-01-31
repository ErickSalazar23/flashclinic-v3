"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryPendingDecisionRepository = void 0;
class InMemoryPendingDecisionRepository {
    constructor() {
        this.decisiones = new Map();
    }
    async guardar(pendingDecision) {
        this.decisiones.set(pendingDecision.id, pendingDecision);
    }
    async obtenerPorId(id) {
        const decision = this.decisiones.get(id);
        return decision || null;
    }
    async eliminar(id) {
        this.decisiones.delete(id);
    }
    obtenerTodas() {
        return Array.from(this.decisiones.values());
    }
    limpiar() {
        this.decisiones.clear();
    }
}
exports.InMemoryPendingDecisionRepository = InMemoryPendingDecisionRepository;

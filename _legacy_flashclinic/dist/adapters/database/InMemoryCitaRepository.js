"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryCitaRepository = void 0;
class InMemoryCitaRepository {
    constructor() {
        this.citas = new Map();
    }
    async obtenerPorId(citaId) {
        const cita = this.citas.get(citaId);
        return cita || null;
    }
    async guardar(cita) {
        this.citas.set(cita.id, cita);
    }
    async obtenerTodas(query) {
        let citas = Array.from(this.citas.values());
        if (query?.pacienteId) {
            citas = citas.filter((c) => c.pacienteId === query.pacienteId);
        }
        if (query?.estado) {
            citas = citas.filter((c) => c.estado === query.estado);
        }
        return citas;
    }
    limpiar() {
        this.citas.clear();
    }
}
exports.InMemoryCitaRepository = InMemoryCitaRepository;

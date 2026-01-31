"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryPacienteRepository = void 0;
class InMemoryPacienteRepository {
    constructor() {
        this.pacientes = new Map();
    }
    async obtenerPorId(pacienteId) {
        return this.pacientes.get(pacienteId) || null;
    }
    async obtenerTodos() {
        return Array.from(this.pacientes.values());
    }
    async guardar(paciente) {
        this.pacientes.set(paciente.id, paciente);
    }
    limpiar() {
        this.pacientes.clear();
    }
}
exports.InMemoryPacienteRepository = InMemoryPacienteRepository;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListarPacientes = void 0;
class ListarPacientes {
    constructor(obtenerPacientePort) {
        this.obtenerPacientePort = obtenerPacientePort;
    }
    async execute() {
        try {
            const pacientes = await this.obtenerPacientePort.obtenerTodos();
            return { ok: true, value: pacientes };
        }
        catch (error) {
            const mensaje = error instanceof Error
                ? error.message
                : "Error desconocido al listar pacientes";
            return { ok: false, error: mensaje };
        }
    }
}
exports.ListarPacientes = ListarPacientes;

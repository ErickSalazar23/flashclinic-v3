"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActualizarEstadoCita = void 0;
class ActualizarEstadoCita {
    constructor(confirmarCita, cancelarCita, marcarAtendida, registrarNoAsistencia) {
        this.confirmarCita = confirmarCita;
        this.cancelarCita = cancelarCita;
        this.marcarAtendida = marcarAtendida;
        this.registrarNoAsistencia = registrarNoAsistencia;
    }
    async execute(command) {
        switch (command.nuevoEstado) {
            case "Confirmada":
                return this.confirmarCita.execute({ citaId: command.citaId });
            case "Cancelada":
                return this.cancelarCita.execute({ citaId: command.citaId });
            case "Atendida":
                return this.marcarAtendida.execute({ citaId: command.citaId });
            case "NoAsistió":
                return this.registrarNoAsistencia.execute({ citaId: command.citaId });
            case "Reprogramada":
                return {
                    ok: false,
                    error: "Use POST /citas/reprogramar con nueva fecha",
                };
            case "Solicitada":
                return {
                    ok: false,
                    error: "No se puede transicionar al estado Solicitada",
                };
            default:
                return { ok: false, error: `Estado no válido: ${command.nuevoEstado}` };
        }
    }
}
exports.ActualizarEstadoCita = ActualizarEstadoCita;

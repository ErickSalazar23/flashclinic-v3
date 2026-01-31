"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarcarCitaComoAtendida = void 0;
class MarcarCitaComoAtendida {
    constructor(obtenerCitaPort, guardarCitaPort, publicarEventoPort) {
        this.obtenerCitaPort = obtenerCitaPort;
        this.guardarCitaPort = guardarCitaPort;
        this.publicarEventoPort = publicarEventoPort;
    }
    async execute(command) {
        try {
            const citaExistente = await this.obtenerCitaPort.obtenerPorId(command.citaId);
            if (!citaExistente) {
                return {
                    ok: false,
                    error: `No se encontró la cita con id: ${command.citaId}`,
                };
            }
            if (citaExistente.estado !== "Confirmada") {
                return {
                    ok: false,
                    error: `Solo se puede marcar como atendida una cita en estado Confirmada. Estado actual: ${citaExistente.estado}`,
                };
            }
            const ahora = new Date();
            const { evento, nuevaCita } = citaExistente.cambiarEstado("Atendida", ahora);
            await this.publicarEventoPort.publicar(evento);
            await this.guardarCitaPort.guardar(nuevaCita);
            return {
                ok: true,
                value: nuevaCita,
            };
        }
        catch (error) {
            let mensaje = "Error desconocido al marcar la cita como atendida";
            if (error instanceof Error && error.message) {
                mensaje = error.message;
            }
            return {
                ok: false,
                error: mensaje,
            };
        }
    }
}
exports.MarcarCitaComoAtendida = MarcarCitaComoAtendida;

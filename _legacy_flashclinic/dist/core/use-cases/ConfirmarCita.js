"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfirmarCita = void 0;
class ConfirmarCita {
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
            if (citaExistente.estado !== "Solicitada") {
                return {
                    ok: false,
                    error: `Solo se puede confirmar una cita en estado Solicitada. Estado actual: ${citaExistente.estado}`,
                };
            }
            const ahora = new Date();
            const { evento, nuevaCita } = citaExistente.cambiarEstado("Confirmada", ahora);
            await this.publicarEventoPort.publicar(evento);
            await this.guardarCitaPort.guardar(nuevaCita);
            return {
                ok: true,
                value: nuevaCita,
            };
        }
        catch (error) {
            let mensaje = "Error desconocido al confirmar la cita";
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
exports.ConfirmarCita = ConfirmarCita;

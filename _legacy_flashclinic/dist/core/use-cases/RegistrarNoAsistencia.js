"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegistrarNoAsistencia = void 0;
class RegistrarNoAsistencia {
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
                    error: `Solo se puede registrar no asistencia en una cita en estado Confirmada. Estado actual: ${citaExistente.estado}`,
                };
            }
            const ahora = new Date();
            const { evento, nuevaCita } = citaExistente.cambiarEstado("NoAsistió", ahora);
            await this.publicarEventoPort.publicar(evento);
            await this.guardarCitaPort.guardar(nuevaCita);
            return {
                ok: true,
                value: nuevaCita,
            };
        }
        catch (error) {
            let mensaje = "Error desconocido al registrar no asistencia";
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
exports.RegistrarNoAsistencia = RegistrarNoAsistencia;

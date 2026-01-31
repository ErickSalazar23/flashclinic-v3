"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CancelarCita = void 0;
class CancelarCita {
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
            const ahora = new Date();
            const { eventoCancelada, eventoEstadoCambiado, nuevaCita, } = citaExistente.cancelar(ahora);
            await this.publicarEventoPort.publicar(eventoCancelada);
            await this.publicarEventoPort.publicar(eventoEstadoCambiado);
            await this.guardarCitaPort.guardar(nuevaCita);
            return {
                ok: true,
                value: nuevaCita,
            };
        }
        catch (error) {
            let mensaje = "Error desconocido al cancelar la cita";
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
exports.CancelarCita = CancelarCita;

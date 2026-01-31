"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SobrescribirPrioridadCita = void 0;
class SobrescribirPrioridadCita {
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
            const { evento, nuevaCita } = citaExistente.sobrescribirPrioridad(command.nuevaPrioridad, command.justificacion, command.modificadoPor, ahora);
            await this.publicarEventoPort.publicar(evento);
            await this.guardarCitaPort.guardar(nuevaCita);
            return {
                ok: true,
                value: nuevaCita,
            };
        }
        catch (error) {
            let mensaje = "Error desconocido al sobrescribir la prioridad";
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
exports.SobrescribirPrioridadCita = SobrescribirPrioridadCita;

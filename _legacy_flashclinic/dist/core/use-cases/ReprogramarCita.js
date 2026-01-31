"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReprogramarCita = void 0;
const Cita_1 = require("../domain/entities/Cita");
const CitaReprogramada_1 = require("../domain/events/CitaReprogramada");
const CitaSolicitada_1 = require("../domain/events/CitaSolicitada");
class ReprogramarCita {
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
                    error: `Solo se puede reprogramar una cita en estado Confirmada. Estado actual: ${citaExistente.estado}`,
                };
            }
            const ahora = new Date();
            const { evento: eventoEstadoCambiado, nuevaCita: citaOriginalActualizada } = citaExistente.cambiarEstado("Reprogramada", ahora);
            const eventoReprogramada = new CitaReprogramada_1.CitaReprogramada({
                citaId: citaExistente.id,
                fechaHoraAnterior: citaExistente.fechaHora,
                fechaHoraNueva: command.nuevaFechaHora,
                ocurrioEn: ahora,
            });
            const citaNueva = new Cita_1.Cita({
                id: command.nuevaCitaId,
                pacienteId: citaExistente.pacienteId,
                especialidad: citaExistente.especialidad,
                fechaHora: command.nuevaFechaHora,
                prioridadInicial: citaExistente.prioridad,
                creadoEn: ahora,
            });
            const eventoCitaSolicitada = new CitaSolicitada_1.CitaSolicitada({
                citaId: citaNueva.id,
                pacienteId: citaNueva.pacienteId,
                especialidad: citaNueva.especialidad,
                fechaHora: citaNueva.fechaHora,
                prioridad: citaNueva.prioridad,
                ocurrioEn: ahora,
            });
            await this.publicarEventoPort.publicar(eventoEstadoCambiado);
            await this.publicarEventoPort.publicar(eventoReprogramada);
            await this.publicarEventoPort.publicar(eventoCitaSolicitada);
            await this.guardarCitaPort.guardar(citaOriginalActualizada);
            await this.guardarCitaPort.guardar(citaNueva);
            return {
                ok: true,
                value: {
                    citaOriginal: citaOriginalActualizada,
                    citaNueva: citaNueva,
                },
            };
        }
        catch (error) {
            let mensaje = "Error desconocido al reprogramar la cita";
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
exports.ReprogramarCita = ReprogramarCita;

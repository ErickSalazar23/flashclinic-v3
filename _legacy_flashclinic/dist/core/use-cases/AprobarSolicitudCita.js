"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AprobarSolicitudCita = void 0;
const Cita_1 = require("../domain/entities/Cita");
const CitaSolicitada_1 = require("../domain/events/CitaSolicitada");
const HistorialEstado_1 = require("../domain/value-objects/HistorialEstado");
const HistorialPrioridad_1 = require("../domain/value-objects/HistorialPrioridad");
class AprobarSolicitudCita {
    constructor(obtenerPendingDecisionPort, eliminarPendingDecisionPort, obtenerCitaPort, guardarCitaPort, publicarEventoPort) {
        this.obtenerPendingDecisionPort = obtenerPendingDecisionPort;
        this.eliminarPendingDecisionPort = eliminarPendingDecisionPort;
        this.obtenerCitaPort = obtenerCitaPort;
        this.guardarCitaPort = guardarCitaPort;
        this.publicarEventoPort = publicarEventoPort;
    }
    async execute(command) {
        try {
            const pendingDecision = await this.obtenerPendingDecisionPort.obtenerPorId(command.decisionId);
            if (!pendingDecision) {
                return {
                    ok: false,
                    error: `Decisión pendiente no encontrada: ${command.decisionId}`,
                };
            }
            const context = pendingDecision.decisionContext;
            const metadata = context.metadata;
            if (!metadata?.solicitudCita) {
                return {
                    ok: false,
                    error: "La decisión pendiente no contiene datos de solicitud de cita",
                };
            }
            const solicitud = metadata.solicitudCita;
            // Idempotency check: verify cita doesn't already exist
            const citaExistente = await this.obtenerCitaPort.obtenerPorId(solicitud.id);
            if (citaExistente) {
                return {
                    ok: false,
                    estado: "ya_aprobada",
                    error: "La solicitud de cita ya fue aprobada previamente",
                };
            }
            const decisionResult = pendingDecision.decisionResult;
            const prioridad = decisionResult.recomendacionPrincipal?.valor;
            if (!prioridad) {
                return {
                    ok: false,
                    error: "No se pudo determinar la prioridad de la cita",
                };
            }
            const ahora = new Date();
            const fechaHora = new Date(solicitud.fechaHora);
            const historialEstado = new HistorialEstado_1.HistorialEstado([
                {
                    estado: "Confirmada",
                    ocurrioEn: ahora,
                },
            ]);
            const historialPrioridad = new HistorialPrioridad_1.HistorialPrioridad([
                {
                    prioridad: prioridad,
                    origen: "Sistema",
                    ocurrioEn: ahora,
                },
            ]);
            const cita = new Cita_1.Cita({
                id: solicitud.id,
                pacienteId: solicitud.pacienteId,
                especialidad: solicitud.especialidad,
                fechaHora: fechaHora,
                prioridadInicial: prioridad,
                creadoEn: ahora,
                historialEstado,
                historialPrioridad,
            });
            const evento = new CitaSolicitada_1.CitaSolicitada({
                citaId: cita.id,
                pacienteId: cita.pacienteId,
                especialidad: cita.especialidad,
                fechaHora: cita.fechaHora,
                prioridad: cita.prioridad,
                ocurrioEn: ahora,
            });
            await this.guardarCitaPort.guardar(cita);
            await this.publicarEventoPort.publicar(evento);
            await this.eliminarPendingDecisionPort.eliminar(command.decisionId);
            return {
                ok: true,
                value: cita,
            };
        }
        catch (error) {
            let mensaje = "Error desconocido al aprobar la solicitud de cita";
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
exports.AprobarSolicitudCita = AprobarSolicitudCita;

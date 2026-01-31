"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SolicitarCitaUseCase = void 0;
const Cita_1 = require("../domain/entities/Cita");
const CitaSolicitada_1 = require("../domain/events/CitaSolicitada");
const PendingDecision_1 = require("../domain/entities/PendingDecision");
const DecisionEngine_1 = require("../decision-engine/DecisionEngine");
class SolicitarCitaUseCase {
    constructor(publicarEventoPort, guardarPendingDecisionPort) {
        this.publicarEventoPort = publicarEventoPort;
        this.guardarPendingDecisionPort = guardarPendingDecisionPort;
        this.decisionEngine = new DecisionEngine_1.DecisionEngine();
    }
    async execute(command) {
        try {
            const contexto = {
                tipo: "prioridad_cita",
                datos: {
                    motivo: command.motivo,
                    edad: command.edad,
                    tiempoEsperaDias: command.tiempoEsperaDias,
                },
                metadata: {
                    solicitudCita: {
                        id: command.id,
                        pacienteId: command.pacienteId,
                        especialidad: command.especialidad,
                        fechaHora: command.fechaHora.toISOString(),
                    },
                },
            };
            const decisionResult = this.decisionEngine.evaluar(contexto);
            if (!decisionResult.recomendacionPrincipal) {
                return {
                    ok: false,
                    error: decisionResult.razonIntervencion ||
                        "No se pudo determinar la prioridad de la cita",
                };
            }
            if (decisionResult.autonomyLevel === "BLOCKED" ||
                decisionResult.autonomyLevel === "SUPERVISED") {
                const ahora = new Date();
                const pendingDecisionId = `pending-${command.id}-${ahora.getTime()}`;
                const pendingDecision = new PendingDecision_1.PendingDecision({
                    id: pendingDecisionId,
                    decisionContext: contexto,
                    decisionResult: decisionResult,
                    autonomyLevel: decisionResult.autonomyLevel,
                    razon: decisionResult.razonIntervencion ||
                        `Decisión ${decisionResult.autonomyLevel} que requiere intervención`,
                    creadoEn: ahora,
                });
                await this.guardarPendingDecisionPort.guardar(pendingDecision);
                return {
                    ok: false,
                    estado: "criterio_pendiente",
                    pendingDecisionId: pendingDecision.id,
                };
            }
            const prioridad = decisionResult.recomendacionPrincipal
                .valor;
            const ahora = new Date();
            const cita = new Cita_1.Cita({
                id: command.id,
                pacienteId: command.pacienteId,
                especialidad: command.especialidad,
                fechaHora: command.fechaHora,
                prioridadInicial: prioridad,
                creadoEn: ahora,
            });
            const evento = new CitaSolicitada_1.CitaSolicitada({
                citaId: cita.id,
                pacienteId: cita.pacienteId,
                especialidad: cita.especialidad,
                fechaHora: cita.fechaHora,
                prioridad: cita.prioridad,
                ocurrioEn: ahora,
            });
            await this.publicarEventoPort.publicar(evento);
            return {
                ok: true,
                value: cita,
            };
        }
        catch (error) {
            let mensaje = "Error desconocido al solicitar la cita";
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
exports.SolicitarCitaUseCase = SolicitarCitaUseCase;

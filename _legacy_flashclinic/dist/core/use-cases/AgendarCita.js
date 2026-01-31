"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgendarCita = void 0;
const Cita_1 = require("../domain/entities/Cita");
const DecisionEngine_1 = require("../decision-engine/DecisionEngine");
class AgendarCita {
    constructor(guardarCitaPort) {
        this.guardarCitaPort = guardarCitaPort;
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
            };
            const decisionResult = this.decisionEngine.evaluar(contexto);
            if (!decisionResult.recomendacionPrincipal) {
                const err = decisionResult.razonIntervencion ||
                    new Error("No se pudo determinar la prioridad de la cita");
                return {
                    ok: false,
                    error: err instanceof Error ? err : new Error(err),
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
            await this.guardarCitaPort.guardar(cita);
            return {
                ok: true,
                value: cita,
            };
        }
        catch (error) {
            const err = error instanceof Error
                ? error
                : new Error("Error desconocido al agendar la cita");
            return {
                ok: false,
                error: err,
            };
        }
    }
}
exports.AgendarCita = AgendarCita;

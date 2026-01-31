"use strict";
// Evento de dominio que registra el hecho de que una cita fue solicitada
// y habilita decisiones posteriores (confirmar, reprogramar, notificar, etc.)
Object.defineProperty(exports, "__esModule", { value: true });
exports.CitaSolicitada = void 0;
class CitaSolicitada {
    constructor(params) {
        this.citaId = params.citaId;
        this.pacienteId = params.pacienteId;
        this.especialidad = params.especialidad;
        this.fechaHora = new Date(params.fechaHora);
        this.prioridad = params.prioridad;
        this.ocurrioEn = params.ocurrioEn;
    }
}
exports.CitaSolicitada = CitaSolicitada;

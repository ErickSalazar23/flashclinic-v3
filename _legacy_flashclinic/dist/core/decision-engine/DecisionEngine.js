"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecisionEngine = void 0;
const PrioridadDecision_1 = require("./decisions/PrioridadDecision");
class DecisionEngine {
    constructor() {
        this.prioridadDecision = new PrioridadDecision_1.PrioridadDecision();
    }
    evaluar(contexto) {
        const peso = contexto.peso || "MEDIUM";
        switch (contexto.tipo) {
            case "prioridad_cita":
                return this.prioridadDecision.evaluar(contexto, peso);
            default:
                return {
                    opciones: [],
                    tradeoffs: [],
                    recomendacionPrincipal: null,
                    requiereIntervencionHumana: true,
                    razonIntervencion: `Tipo de decisión desconocido: ${contexto.tipo}`,
                    autonomyLevel: "BLOCKED",
                };
        }
    }
}
exports.DecisionEngine = DecisionEngine;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrioridadCitaSobrescritaPorHumano = void 0;
class PrioridadCitaSobrescritaPorHumano {
    constructor(params) {
        if (!params.justificacion || params.justificacion.trim().length === 0) {
            throw new Error("La justificación es obligatoria para sobrescribir prioridad");
        }
        if (!params.modificadoPor || params.modificadoPor.trim().length === 0) {
            throw new Error("El identificador del modificador es obligatorio");
        }
        this.citaId = params.citaId;
        this.prioridadAnterior = params.prioridadAnterior;
        this.prioridadNueva = params.prioridadNueva;
        this.justificacion = params.justificacion.trim();
        this.modificadoPor = params.modificadoPor;
        this.ocurrioEn = params.ocurrioEn;
    }
}
exports.PrioridadCitaSobrescritaPorHumano = PrioridadCitaSobrescritaPorHumano;

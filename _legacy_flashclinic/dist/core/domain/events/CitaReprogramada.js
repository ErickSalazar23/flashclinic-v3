"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CitaReprogramada = void 0;
class CitaReprogramada {
    constructor(params) {
        this.citaId = params.citaId;
        this.fechaHoraAnterior = new Date(params.fechaHoraAnterior);
        this.fechaHoraNueva = new Date(params.fechaHoraNueva);
        this.ocurrioEn = params.ocurrioEn;
    }
}
exports.CitaReprogramada = CitaReprogramada;

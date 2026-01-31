"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EstadoCitaCambiado = void 0;
class EstadoCitaCambiado {
    constructor(params) {
        this.citaId = params.citaId;
        this.estadoAnterior = params.estadoAnterior;
        this.estadoNuevo = params.estadoNuevo;
        this.ocurrioEn = params.ocurrioEn;
    }
}
exports.EstadoCitaCambiado = EstadoCitaCambiado;

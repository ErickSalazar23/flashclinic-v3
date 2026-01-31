"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HistorialEstado = void 0;
class HistorialEstado {
    constructor(registros = []) {
        this.validarOrdenCronologico(registros);
        this.validarTimestampsUnicos(registros);
        this._registros = [...registros].sort((a, b) => a.ocurrioEn.getTime() - b.ocurrioEn.getTime());
    }
    obtenerEstadoActual() {
        if (this._registros.length === 0) {
            throw new Error("El historial de estados está vacío");
        }
        return this._registros[this._registros.length - 1].estado;
    }
    obtenerHistorialCompleto() {
        return this._registros;
    }
    agregarEstado(registro) {
        const nuevosRegistros = [...this._registros, registro];
        return new HistorialEstado(nuevosRegistros);
    }
    validarOrdenCronologico(registros) {
        const timestamps = registros.map((r) => r.ocurrioEn.getTime());
        const ordenados = [...timestamps].sort((a, b) => a - b);
        for (let i = 0; i < timestamps.length; i++) {
            if (timestamps[i] !== ordenados[i]) {
                throw new Error("El historial de estados debe estar en orden cronológico");
            }
        }
    }
    validarTimestampsUnicos(registros) {
        const timestamps = registros.map((r) => r.ocurrioEn.getTime());
        const unicos = new Set(timestamps);
        if (timestamps.length !== unicos.size) {
            throw new Error("No pueden existir múltiples estados con el mismo timestamp");
        }
    }
}
exports.HistorialEstado = HistorialEstado;

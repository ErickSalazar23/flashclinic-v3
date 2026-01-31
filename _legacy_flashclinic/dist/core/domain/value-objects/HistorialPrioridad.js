"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HistorialPrioridad = void 0;
class HistorialPrioridad {
    constructor(registros = []) {
        this.validarOrdenCronologico(registros);
        this.validarTimestampsUnicos(registros);
        this.validarJustificacionHumana(registros);
        this._registros = [...registros].sort((a, b) => a.ocurrioEn.getTime() - b.ocurrioEn.getTime());
    }
    obtenerPrioridadActual() {
        if (this._registros.length === 0) {
            throw new Error("El historial de prioridades está vacío");
        }
        return this._registros[this._registros.length - 1].prioridad;
    }
    obtenerOrigenActual() {
        if (this._registros.length === 0) {
            throw new Error("El historial de prioridades está vacío");
        }
        return this._registros[this._registros.length - 1].origen;
    }
    obtenerHistorialCompleto() {
        return this._registros;
    }
    agregarPrioridad(registro) {
        const nuevosRegistros = [...this._registros, registro];
        return new HistorialPrioridad(nuevosRegistros);
    }
    validarOrdenCronologico(registros) {
        const timestamps = registros.map((r) => r.ocurrioEn.getTime());
        const ordenados = [...timestamps].sort((a, b) => a - b);
        for (let i = 0; i < timestamps.length; i++) {
            if (timestamps[i] !== ordenados[i]) {
                throw new Error("El historial de prioridades debe estar en orden cronológico");
            }
        }
    }
    validarTimestampsUnicos(registros) {
        const timestamps = registros.map((r) => r.ocurrioEn.getTime());
        const unicos = new Set(timestamps);
        if (timestamps.length !== unicos.size) {
            throw new Error("No pueden existir múltiples prioridades con el mismo timestamp");
        }
    }
    validarJustificacionHumana(registros) {
        for (const registro of registros) {
            if (registro.origen === "Humano") {
                if (!registro.justificacion ||
                    registro.justificacion.trim().length === 0) {
                    throw new Error("La justificación es obligatoria cuando el origen es Humano");
                }
                if (!registro.modificadoPor || registro.modificadoPor.trim().length === 0) {
                    throw new Error("El modificador es obligatorio cuando el origen es Humano");
                }
            }
        }
    }
}
exports.HistorialPrioridad = HistorialPrioridad;

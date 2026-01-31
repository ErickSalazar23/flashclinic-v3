"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PendingDecision = void 0;
class PendingDecision {
    constructor(params) {
        PendingDecision.validarId(params.id);
        PendingDecision.validarRazon(params.razon);
        PendingDecision.validarFechaCreacion(params.creadoEn);
        this._id = params.id;
        this._decisionContext = params.decisionContext;
        this._decisionResult = params.decisionResult;
        this._autonomyLevel = params.autonomyLevel;
        this._razon = params.razon.trim();
        this._creadoEn = new Date(params.creadoEn);
    }
    get id() {
        return this._id;
    }
    get decisionContext() {
        return { ...this._decisionContext };
    }
    get decisionResult() {
        return { ...this._decisionResult };
    }
    get autonomyLevel() {
        return this._autonomyLevel;
    }
    get razon() {
        return this._razon;
    }
    get creadoEn() {
        return new Date(this._creadoEn);
    }
    static validarId(id) {
        if (!id || id.trim().length === 0) {
            throw new Error("El id de la decisión pendiente es requerido");
        }
    }
    static validarRazon(razon) {
        if (!razon || razon.trim().length === 0) {
            throw new Error("La razón de la decisión pendiente es requerida");
        }
    }
    static validarFechaCreacion(creadoEn) {
        if (!(creadoEn instanceof Date) || isNaN(creadoEn.getTime())) {
            throw new Error("La fecha de creación debe ser una fecha válida");
        }
    }
}
exports.PendingDecision = PendingDecision;

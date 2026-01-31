import { DecisionContext } from "../../decision-engine/DecisionContext";
import { DecisionResult } from "../../decision-engine/DecisionResult";
import { AutonomyLevel } from "../../decision-engine/AutonomyLevel";

export class PendingDecision {
  private readonly _id: string;
  private readonly _decisionContext: DecisionContext;
  private readonly _decisionResult: DecisionResult;
  private readonly _autonomyLevel: AutonomyLevel;
  private readonly _razon: string;
  private readonly _creadoEn: Date;

  constructor(params: {
    id: string;
    decisionContext: DecisionContext;
    decisionResult: DecisionResult;
    autonomyLevel: AutonomyLevel;
    razon: string;
    creadoEn: Date;
  }) {
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

  get id(): string {
    return this._id;
  }

  get decisionContext(): DecisionContext {
    return { ...this._decisionContext };
  }

  get decisionResult(): DecisionResult {
    return { ...this._decisionResult };
  }

  get autonomyLevel(): AutonomyLevel {
    return this._autonomyLevel;
  }

  get razon(): string {
    return this._razon;
  }

  get creadoEn(): Date {
    return new Date(this._creadoEn);
  }

  private static validarId(id: string): void {
    if (!id || id.trim().length === 0) {
      throw new Error("El id de la decisión pendiente es requerido");
    }
  }

  private static validarRazon(razon: string): void {
    if (!razon || razon.trim().length === 0) {
      throw new Error("La razón de la decisión pendiente es requerida");
    }
  }

  private static validarFechaCreacion(creadoEn: Date): void {
    if (!(creadoEn instanceof Date) || isNaN(creadoEn.getTime())) {
      throw new Error("La fecha de creación debe ser una fecha válida");
    }
  }
}

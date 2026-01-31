import { DecisionContext } from "../../decision-engine/DecisionContext";
import { DecisionResult } from "../../decision-engine/DecisionResult";
import { AutonomyLevel } from "../../decision-engine/AutonomyLevel";
export declare class PendingDecision {
    private readonly _id;
    private readonly _decisionContext;
    private readonly _decisionResult;
    private readonly _autonomyLevel;
    private readonly _razon;
    private readonly _creadoEn;
    constructor(params: {
        id: string;
        decisionContext: DecisionContext;
        decisionResult: DecisionResult;
        autonomyLevel: AutonomyLevel;
        razon: string;
        creadoEn: Date;
    });
    get id(): string;
    get decisionContext(): DecisionContext;
    get decisionResult(): DecisionResult;
    get autonomyLevel(): AutonomyLevel;
    get razon(): string;
    get creadoEn(): Date;
    private static validarId;
    private static validarRazon;
    private static validarFechaCreacion;
}

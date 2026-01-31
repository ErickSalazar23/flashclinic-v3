import { DecisionContext } from "./DecisionContext";
import { DecisionResult } from "./DecisionResult";
export declare class DecisionEngine {
    private readonly prioridadDecision;
    constructor();
    evaluar(contexto: DecisionContext): DecisionResult;
}

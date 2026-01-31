import { DecisionWeight } from "./DecisionWeight";
export interface DecisionContext {
    readonly tipo: string;
    readonly datos: Record<string, unknown>;
    readonly peso?: DecisionWeight;
    readonly metadata?: Record<string, unknown>;
}

import { PendingDecision } from "../domain/entities/PendingDecision";

export interface ObtenerPendingDecisionPort {
  obtenerPorId(id: string): Promise<PendingDecision | null>;
}

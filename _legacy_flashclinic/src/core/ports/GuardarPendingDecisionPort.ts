import { PendingDecision } from "../domain/entities/PendingDecision";

export interface GuardarPendingDecisionPort {
  guardar(pendingDecision: PendingDecision): Promise<void>;
}

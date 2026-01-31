import { PendingDecision } from "../../core/domain/entities/PendingDecision";
import { GuardarPendingDecisionPort } from "../../core/ports/GuardarPendingDecisionPort";
import { ObtenerPendingDecisionPort } from "../../core/ports/ObtenerPendingDecisionPort";
import { EliminarPendingDecisionPort } from "../../core/ports/EliminarPendingDecisionPort";

export class InMemoryPendingDecisionRepository
  implements GuardarPendingDecisionPort, ObtenerPendingDecisionPort, EliminarPendingDecisionPort
{
  private readonly decisiones: Map<string, PendingDecision> = new Map();

  async guardar(pendingDecision: PendingDecision): Promise<void> {
    this.decisiones.set(pendingDecision.id, pendingDecision);
  }

  async obtenerPorId(id: string): Promise<PendingDecision | null> {
    const decision = this.decisiones.get(id);
    return decision || null;
  }

  async eliminar(id: string): Promise<void> {
    this.decisiones.delete(id);
  }

  obtenerTodas(): PendingDecision[] {
    return Array.from(this.decisiones.values());
  }

  limpiar(): void {
    this.decisiones.clear();
  }
}

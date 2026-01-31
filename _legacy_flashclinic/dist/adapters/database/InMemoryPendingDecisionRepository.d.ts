import { PendingDecision } from "../../core/domain/entities/PendingDecision";
import { GuardarPendingDecisionPort } from "../../core/ports/GuardarPendingDecisionPort";
import { ObtenerPendingDecisionPort } from "../../core/ports/ObtenerPendingDecisionPort";
import { EliminarPendingDecisionPort } from "../../core/ports/EliminarPendingDecisionPort";
export declare class InMemoryPendingDecisionRepository implements GuardarPendingDecisionPort, ObtenerPendingDecisionPort, EliminarPendingDecisionPort {
    private readonly decisiones;
    guardar(pendingDecision: PendingDecision): Promise<void>;
    obtenerPorId(id: string): Promise<PendingDecision | null>;
    eliminar(id: string): Promise<void>;
    obtenerTodas(): PendingDecision[];
    limpiar(): void;
}

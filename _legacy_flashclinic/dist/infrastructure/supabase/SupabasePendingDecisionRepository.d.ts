import { SupabaseClient } from "@supabase/supabase-js";
import { PendingDecision } from "../../core/domain/entities/PendingDecision";
import { GuardarPendingDecisionPort } from "../../core/ports/GuardarPendingDecisionPort";
import { ObtenerPendingDecisionPort } from "../../core/ports/ObtenerPendingDecisionPort";
import { EliminarPendingDecisionPort } from "../../core/ports/EliminarPendingDecisionPort";
export declare class SupabasePendingDecisionRepository implements GuardarPendingDecisionPort, ObtenerPendingDecisionPort, EliminarPendingDecisionPort {
    private readonly supabase;
    constructor(supabase: SupabaseClient);
    guardar(pendingDecision: PendingDecision): Promise<void>;
    obtenerPorId(id: string): Promise<PendingDecision | null>;
    obtenerTodos(): Promise<PendingDecision[]>;
    eliminar(id: string): Promise<void>;
    private mapToDomain;
}

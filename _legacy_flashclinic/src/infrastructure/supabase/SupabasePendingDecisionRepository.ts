import { SupabaseClient } from "@supabase/supabase-js";
import { PendingDecision } from "../../core/domain/entities/PendingDecision";
import { GuardarPendingDecisionPort } from "../../core/ports/GuardarPendingDecisionPort";
import { ObtenerPendingDecisionPort } from "../../core/ports/ObtenerPendingDecisionPort";
import { EliminarPendingDecisionPort } from "../../core/ports/EliminarPendingDecisionPort";
import { DecisionContext } from "../../core/decision-engine/DecisionContext";
import { DecisionResult } from "../../core/decision-engine/DecisionResult";
import { AutonomyLevel } from "../../core/decision-engine/AutonomyLevel";

interface PendingDecisionRow {
  id: string;
  decision_context: DecisionContext;
  decision_result: DecisionResult;
  autonomy_level: string;
  razon: string;
  creado_en: string;
}

export class SupabasePendingDecisionRepository
  implements GuardarPendingDecisionPort, ObtenerPendingDecisionPort, EliminarPendingDecisionPort
{
  constructor(private readonly supabase: SupabaseClient) {}

  async guardar(pendingDecision: PendingDecision): Promise<void> {
    const { error } = await this.supabase.from("pending_decisions").upsert({
      id: pendingDecision.id,
      decision_context: pendingDecision.decisionContext,
      decision_result: pendingDecision.decisionResult,
      autonomy_level: pendingDecision.autonomyLevel,
      razon: pendingDecision.razon,
      creado_en: pendingDecision.creadoEn.toISOString(),
    });

    if (error) {
      throw new Error(`Error saving pending decision: ${error.message}`);
    }
  }

  async obtenerPorId(id: string): Promise<PendingDecision | null> {
    const { data, error } = await this.supabase
      .from("pending_decisions")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return null;
    }

    return this.mapToDomain(data as PendingDecisionRow);
  }

  async obtenerTodos(): Promise<PendingDecision[]> {
    const { data, error } = await this.supabase
      .from("pending_decisions")
      .select("*")
      .order("creado_en", { ascending: false });

    if (error) {
      throw new Error(`Error fetching pending decisions: ${error.message}`);
    }

    return (data || []).map((row) =>
      this.mapToDomain(row as PendingDecisionRow)
    );
  }

  async eliminar(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("pending_decisions")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(`Error deleting pending decision: ${error.message}`);
    }
  }

  private mapToDomain(row: PendingDecisionRow): PendingDecision {
    return new PendingDecision({
      id: row.id,
      decisionContext: row.decision_context,
      decisionResult: row.decision_result,
      autonomyLevel: row.autonomy_level as AutonomyLevel,
      razon: row.razon,
      creadoEn: new Date(row.creado_en),
    });
  }
}

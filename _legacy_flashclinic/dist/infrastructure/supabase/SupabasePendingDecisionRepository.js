"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupabasePendingDecisionRepository = void 0;
const PendingDecision_1 = require("../../core/domain/entities/PendingDecision");
class SupabasePendingDecisionRepository {
    constructor(supabase) {
        this.supabase = supabase;
    }
    async guardar(pendingDecision) {
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
    async obtenerPorId(id) {
        const { data, error } = await this.supabase
            .from("pending_decisions")
            .select("*")
            .eq("id", id)
            .single();
        if (error || !data) {
            return null;
        }
        return this.mapToDomain(data);
    }
    async obtenerTodos() {
        const { data, error } = await this.supabase
            .from("pending_decisions")
            .select("*")
            .order("creado_en", { ascending: false });
        if (error) {
            throw new Error(`Error fetching pending decisions: ${error.message}`);
        }
        return (data || []).map((row) => this.mapToDomain(row));
    }
    async eliminar(id) {
        const { error } = await this.supabase
            .from("pending_decisions")
            .delete()
            .eq("id", id);
        if (error) {
            throw new Error(`Error deleting pending decision: ${error.message}`);
        }
    }
    mapToDomain(row) {
        return new PendingDecision_1.PendingDecision({
            id: row.id,
            decisionContext: row.decision_context,
            decisionResult: row.decision_result,
            autonomyLevel: row.autonomy_level,
            razon: row.razon,
            creadoEn: new Date(row.creado_en),
        });
    }
}
exports.SupabasePendingDecisionRepository = SupabasePendingDecisionRepository;

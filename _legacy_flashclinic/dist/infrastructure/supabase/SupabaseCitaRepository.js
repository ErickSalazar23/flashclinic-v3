"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupabaseCitaRepository = void 0;
const Cita_1 = require("../../core/domain/entities/Cita");
const HistorialEstado_1 = require("../../core/domain/value-objects/HistorialEstado");
const HistorialPrioridad_1 = require("../../core/domain/value-objects/HistorialPrioridad");
class SupabaseCitaRepository {
    constructor(supabase) {
        this.supabase = supabase;
    }
    async obtenerPorId(citaId) {
        const { data: citaRow, error: citaError } = await this.supabase
            .from("citas")
            .select("*")
            .eq("id", citaId)
            .single();
        if (citaError || !citaRow) {
            return null;
        }
        const { data: estadoRows, error: estadoError } = await this.supabase
            .from("historial_estado_cita")
            .select("*")
            .eq("cita_id", citaId)
            .order("ocurrio_en", { ascending: true });
        if (estadoError) {
            throw new Error(`Error fetching estado history: ${estadoError.message}`);
        }
        const { data: prioridadRows, error: prioridadError } = await this.supabase
            .from("historial_prioridad_cita")
            .select("*")
            .eq("cita_id", citaId)
            .order("ocurrio_en", { ascending: true });
        if (prioridadError) {
            throw new Error(`Error fetching prioridad history: ${prioridadError.message}`);
        }
        return this.mapToDomain(citaRow, (estadoRows || []), (prioridadRows || []));
    }
    async guardar(cita) {
        const { error: upsertError } = await this.supabase.from("citas").upsert({
            id: cita.id,
            paciente_id: cita.pacienteId,
            especialidad: cita.especialidad,
            fecha_hora: cita.fechaHora.toISOString(),
            creado_en: cita.creadoEn.toISOString(),
        });
        if (upsertError) {
            throw new Error(`Error saving cita: ${upsertError.message}`);
        }
        await this.supabase
            .from("historial_estado_cita")
            .delete()
            .eq("cita_id", cita.id);
        const estadoRows = cita.historialEstado.map((registro) => ({
            cita_id: cita.id,
            estado: registro.estado,
            ocurrio_en: registro.ocurrioEn.toISOString(),
            evento_id: registro.eventoId || null,
        }));
        if (estadoRows.length > 0) {
            const { error: estadoError } = await this.supabase
                .from("historial_estado_cita")
                .insert(estadoRows);
            if (estadoError) {
                throw new Error(`Error saving estado history: ${estadoError.message}`);
            }
        }
        await this.supabase
            .from("historial_prioridad_cita")
            .delete()
            .eq("cita_id", cita.id);
        const prioridadRows = cita.historialPrioridad.map((registro) => ({
            cita_id: cita.id,
            prioridad: registro.prioridad,
            origen: registro.origen,
            ocurrio_en: registro.ocurrioEn.toISOString(),
            justificacion: registro.justificacion || null,
            modificado_por: registro.modificadoPor || null,
            evento_id: registro.eventoId || null,
        }));
        if (prioridadRows.length > 0) {
            const { error: prioridadError } = await this.supabase
                .from("historial_prioridad_cita")
                .insert(prioridadRows);
            if (prioridadError) {
                throw new Error(`Error saving prioridad history: ${prioridadError.message}`);
            }
        }
    }
    async obtenerTodas(query) {
        let supabaseQuery = this.supabase
            .from("citas")
            .select("*")
            .order("fecha_hora", { ascending: true });
        if (query?.pacienteId) {
            supabaseQuery = supabaseQuery.eq("paciente_id", query.pacienteId);
        }
        const { data: citaRows, error: citaError } = await supabaseQuery;
        if (citaError) {
            throw new Error(`Error fetching citas: ${citaError.message}`);
        }
        const citas = [];
        for (const citaRow of citaRows || []) {
            const { data: estadoRows } = await this.supabase
                .from("historial_estado_cita")
                .select("*")
                .eq("cita_id", citaRow.id)
                .order("ocurrio_en", { ascending: true });
            const { data: prioridadRows } = await this.supabase
                .from("historial_prioridad_cita")
                .select("*")
                .eq("cita_id", citaRow.id)
                .order("ocurrio_en", { ascending: true });
            const cita = this.mapToDomain(citaRow, (estadoRows || []), (prioridadRows || []));
            if (query?.estado && cita.estado !== query.estado) {
                continue;
            }
            citas.push(cita);
        }
        return citas;
    }
    mapToDomain(row, estadoRows, prioridadRows) {
        const estadoRegistros = estadoRows.map((r) => ({
            estado: r.estado,
            ocurrioEn: new Date(r.ocurrio_en),
            eventoId: r.evento_id || undefined,
        }));
        const prioridadRegistros = prioridadRows.map((r) => ({
            prioridad: r.prioridad,
            origen: r.origen,
            ocurrioEn: new Date(r.ocurrio_en),
            justificacion: r.justificacion || undefined,
            modificadoPor: r.modificado_por || undefined,
            eventoId: r.evento_id || undefined,
        }));
        const historialEstado = new HistorialEstado_1.HistorialEstado(estadoRegistros);
        const historialPrioridad = new HistorialPrioridad_1.HistorialPrioridad(prioridadRegistros);
        const prioridadActual = prioridadRegistros.length > 0
            ? prioridadRegistros[prioridadRegistros.length - 1].prioridad
            : "Media";
        return new Cita_1.Cita({
            id: row.id,
            pacienteId: row.paciente_id,
            especialidad: row.especialidad,
            fechaHora: new Date(row.fecha_hora),
            prioridadInicial: prioridadActual,
            creadoEn: new Date(row.creado_en),
            historialEstado,
            historialPrioridad,
        });
    }
}
exports.SupabaseCitaRepository = SupabaseCitaRepository;

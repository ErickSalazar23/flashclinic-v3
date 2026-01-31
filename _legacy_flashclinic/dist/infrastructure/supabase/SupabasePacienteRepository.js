"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupabasePacienteRepository = void 0;
const Paciente_1 = require("../../core/domain/entities/Paciente");
class SupabasePacienteRepository {
    constructor(supabase) {
        this.supabase = supabase;
    }
    async obtenerPorId(pacienteId) {
        const { data, error } = await this.supabase
            .from("pacientes")
            .select("*")
            .eq("id", pacienteId)
            .single();
        if (error || !data) {
            return null;
        }
        return this.mapToDomain(data);
    }
    async guardar(paciente) {
        const { error } = await this.supabase.from("pacientes").upsert({
            id: paciente.id,
            nombre: paciente.nombre,
            telefono: paciente.telefono,
            fecha_nacimiento: paciente.fechaNacimiento.toISOString(),
            es_recurrente: paciente.esRecurrente,
        });
        if (error) {
            throw new Error(`Error saving paciente: ${error.message}`);
        }
    }
    async obtenerTodos() {
        const { data, error } = await this.supabase
            .from("pacientes")
            .select("*")
            .order("nombre", { ascending: true });
        if (error) {
            throw new Error(`Error fetching pacientes: ${error.message}`);
        }
        return (data || []).map((row) => this.mapToDomain(row));
    }
    mapToDomain(row) {
        return new Paciente_1.Paciente(row.id, row.nombre, row.telefono, new Date(row.fecha_nacimiento), row.es_recurrente);
    }
}
exports.SupabasePacienteRepository = SupabasePacienteRepository;

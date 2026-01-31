import { SupabaseClient } from "@supabase/supabase-js";
import { Paciente } from "../../core/domain/entities/Paciente";
import { ObtenerPacientePort } from "../../core/ports/ObtenerPacientePort";
import { GuardarPacientePort } from "../../core/ports/GuardarPacientePort";
export declare class SupabasePacienteRepository implements ObtenerPacientePort, GuardarPacientePort {
    private readonly supabase;
    constructor(supabase: SupabaseClient);
    obtenerPorId(pacienteId: string): Promise<Paciente | null>;
    guardar(paciente: Paciente): Promise<void>;
    obtenerTodos(): Promise<Paciente[]>;
    private mapToDomain;
}

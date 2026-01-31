import { SupabaseClient } from "@supabase/supabase-js";
import { Paciente } from "../../core/domain/entities/Paciente";
import { ObtenerPacientePort } from "../../core/ports/ObtenerPacientePort";
import { GuardarPacientePort } from "../../core/ports/GuardarPacientePort";

interface PacienteRow {
  id: string;
  nombre: string;
  telefono: string;
  fecha_nacimiento: string;
  es_recurrente: boolean;
}

export class SupabasePacienteRepository
  implements ObtenerPacientePort, GuardarPacientePort
{
  constructor(private readonly supabase: SupabaseClient) {}

  async obtenerPorId(pacienteId: string): Promise<Paciente | null> {
    const { data, error } = await this.supabase
      .from("pacientes")
      .select("*")
      .eq("id", pacienteId)
      .single();

    if (error || !data) {
      return null;
    }

    return this.mapToDomain(data as PacienteRow);
  }

  async guardar(paciente: Paciente): Promise<void> {
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

  async obtenerTodos(): Promise<Paciente[]> {
    const { data, error } = await this.supabase
      .from("pacientes")
      .select("*")
      .order("nombre", { ascending: true });

    if (error) {
      throw new Error(`Error fetching pacientes: ${error.message}`);
    }

    return (data || []).map((row) => this.mapToDomain(row as PacienteRow));
  }

  private mapToDomain(row: PacienteRow): Paciente {
    return new Paciente(
      row.id,
      row.nombre,
      row.telefono,
      new Date(row.fecha_nacimiento),
      row.es_recurrente
    );
  }
}

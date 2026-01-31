import { Paciente } from "../domain/entities/Paciente";

export interface ObtenerPacientePort {
  obtenerPorId(pacienteId: string): Promise<Paciente | null>;
  obtenerTodos(): Promise<Paciente[]>;
}

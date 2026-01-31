import { Paciente } from "../../core/domain/entities/Paciente";
import { ObtenerPacientePort } from "../../core/ports/ObtenerPacientePort";
import { GuardarPacientePort } from "../../core/ports/GuardarPacientePort";

export class InMemoryPacienteRepository
  implements ObtenerPacientePort, GuardarPacientePort
{
  private readonly pacientes: Map<string, Paciente> = new Map();

  async obtenerPorId(pacienteId: string): Promise<Paciente | null> {
    return this.pacientes.get(pacienteId) || null;
  }

  async obtenerTodos(): Promise<Paciente[]> {
    return Array.from(this.pacientes.values());
  }

  async guardar(paciente: Paciente): Promise<void> {
    this.pacientes.set(paciente.id, paciente);
  }

  limpiar(): void {
    this.pacientes.clear();
  }
}

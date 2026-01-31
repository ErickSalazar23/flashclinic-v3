import { Paciente } from "../domain/entities/Paciente";
import { ObtenerPacientePort } from "../ports/ObtenerPacientePort";

export type Result<T> = { ok: true; value: T } | { ok: false; error: string };

export class ListarPacientes {
  constructor(private readonly obtenerPacientePort: ObtenerPacientePort) {}

  async execute(): Promise<Result<Paciente[]>> {
    try {
      const pacientes = await this.obtenerPacientePort.obtenerTodos();
      return { ok: true, value: pacientes };
    } catch (error: unknown) {
      const mensaje =
        error instanceof Error
          ? error.message
          : "Error desconocido al listar pacientes";
      return { ok: false, error: mensaje };
    }
  }
}

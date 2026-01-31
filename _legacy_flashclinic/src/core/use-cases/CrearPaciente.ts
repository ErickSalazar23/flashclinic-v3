import { Paciente } from "../domain/entities/Paciente";
import { ObtenerPacientePort } from "../ports/ObtenerPacientePort";
import { GuardarPacientePort } from "../ports/GuardarPacientePort";

export interface CrearPacienteCommand {
  id: string;
  nombre: string;
  telefono: string;
  fechaNacimiento: Date;
  esRecurrente?: boolean;
}

export type Result<T> = { ok: true; value: T } | { ok: false; error: string };

export class CrearPaciente {
  constructor(
    private readonly obtenerPacientePort: ObtenerPacientePort,
    private readonly guardarPacientePort: GuardarPacientePort
  ) {}

  async execute(command: CrearPacienteCommand): Promise<Result<Paciente>> {
    try {
      const existente = await this.obtenerPacientePort.obtenerPorId(command.id);
      if (existente) {
        return { ok: false, error: `Ya existe un paciente con id: ${command.id}` };
      }

      const paciente = new Paciente(
        command.id,
        command.nombre,
        command.telefono,
        command.fechaNacimiento,
        command.esRecurrente ?? false
      );

      await this.guardarPacientePort.guardar(paciente);

      return { ok: true, value: paciente };
    } catch (error: unknown) {
      const mensaje =
        error instanceof Error
          ? error.message
          : "Error desconocido al crear paciente";
      return { ok: false, error: mensaje };
    }
  }
}

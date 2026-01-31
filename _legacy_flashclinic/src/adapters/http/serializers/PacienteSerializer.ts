import { Paciente } from "../../../core/domain/entities/Paciente";

export interface PacienteDTO {
  id: string;
  nombre: string;
  telefono: string;
  fechaNacimiento: string;
  esRecurrente: boolean;
}

export function serializePaciente(paciente: Paciente): PacienteDTO {
  return {
    id: paciente.id,
    nombre: paciente.nombre,
    telefono: paciente.telefono,
    fechaNacimiento: paciente.fechaNacimiento.toISOString(),
    esRecurrente: paciente.esRecurrente,
  };
}

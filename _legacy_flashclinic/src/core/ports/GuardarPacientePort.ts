import { Paciente } from "../domain/entities/Paciente";

export interface GuardarPacientePort {
  guardar(paciente: Paciente): Promise<void>;
}

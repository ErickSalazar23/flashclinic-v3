import { Paciente } from "../../../core/domain/entities/Paciente";
export interface PacienteDTO {
    id: string;
    nombre: string;
    telefono: string;
    fechaNacimiento: string;
    esRecurrente: boolean;
}
export declare function serializePaciente(paciente: Paciente): PacienteDTO;

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
export type Result<T> = {
    ok: true;
    value: T;
} | {
    ok: false;
    error: string;
};
export declare class CrearPaciente {
    private readonly obtenerPacientePort;
    private readonly guardarPacientePort;
    constructor(obtenerPacientePort: ObtenerPacientePort, guardarPacientePort: GuardarPacientePort);
    execute(command: CrearPacienteCommand): Promise<Result<Paciente>>;
}

import { Paciente } from "../domain/entities/Paciente";
import { ObtenerPacientePort } from "../ports/ObtenerPacientePort";
export type Result<T> = {
    ok: true;
    value: T;
} | {
    ok: false;
    error: string;
};
export declare class ListarPacientes {
    private readonly obtenerPacientePort;
    constructor(obtenerPacientePort: ObtenerPacientePort);
    execute(): Promise<Result<Paciente[]>>;
}

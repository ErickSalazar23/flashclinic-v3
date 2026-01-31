import { Cita } from "../domain/entities/Cita";
import { GuardarCitaPort } from "../ports/GuardarCitaPort";
export interface AgendarCitaCommand {
    id: string;
    pacienteId: string;
    especialidad: string;
    fechaHora: Date;
    motivo: string;
    edad: number;
    tiempoEsperaDias: number;
}
export type Result<T> = {
    ok: true;
    value: T;
} | {
    ok: false;
    error: Error;
};
export declare class AgendarCita {
    private readonly guardarCitaPort;
    private readonly decisionEngine;
    constructor(guardarCitaPort: GuardarCitaPort);
    execute(command: AgendarCitaCommand): Promise<Result<Cita>>;
}

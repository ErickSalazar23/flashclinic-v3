import { Cita } from "../domain/entities/Cita";
import { PublicarEventoPort } from "../ports/PublicarEventoPort";
import { ObtenerCitaPort } from "../ports/ObtenerCitaPort";
import { GuardarCitaPort } from "../ports/GuardarCitaPort";
export interface ReprogramarCitaCommand {
    citaId: string;
    nuevaCitaId: string;
    nuevaFechaHora: Date;
}
export interface ReprogramarCitaResultado {
    citaOriginal: Cita;
    citaNueva: Cita;
}
export type Result<T> = {
    ok: true;
    value: T;
} | {
    ok: false;
    error: string;
};
export declare class ReprogramarCita {
    private readonly obtenerCitaPort;
    private readonly guardarCitaPort;
    private readonly publicarEventoPort;
    constructor(obtenerCitaPort: ObtenerCitaPort, guardarCitaPort: GuardarCitaPort, publicarEventoPort: PublicarEventoPort);
    execute(command: ReprogramarCitaCommand): Promise<Result<ReprogramarCitaResultado>>;
}

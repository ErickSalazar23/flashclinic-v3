import { Cita, PrioridadCita } from "../domain/entities/Cita";
import { PublicarEventoPort } from "../ports/PublicarEventoPort";
import { ObtenerCitaPort } from "../ports/ObtenerCitaPort";
import { GuardarCitaPort } from "../ports/GuardarCitaPort";
export interface SobrescribirPrioridadCitaCommand {
    citaId: string;
    nuevaPrioridad: PrioridadCita;
    justificacion: string;
    modificadoPor: string;
}
export type Result<T> = {
    ok: true;
    value: T;
} | {
    ok: false;
    error: string;
};
export declare class SobrescribirPrioridadCita {
    private readonly obtenerCitaPort;
    private readonly guardarCitaPort;
    private readonly publicarEventoPort;
    constructor(obtenerCitaPort: ObtenerCitaPort, guardarCitaPort: GuardarCitaPort, publicarEventoPort: PublicarEventoPort);
    execute(command: SobrescribirPrioridadCitaCommand): Promise<Result<Cita>>;
}

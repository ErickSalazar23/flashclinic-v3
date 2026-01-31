import { Cita } from "../domain/entities/Cita";
import { PublicarEventoPort } from "../ports/PublicarEventoPort";
import { ObtenerCitaPort } from "../ports/ObtenerCitaPort";
import { GuardarCitaPort } from "../ports/GuardarCitaPort";
export interface ConfirmarCitaCommand {
    citaId: string;
}
export type Result<T> = {
    ok: true;
    value: T;
} | {
    ok: false;
    error: string;
};
export declare class ConfirmarCita {
    private readonly obtenerCitaPort;
    private readonly guardarCitaPort;
    private readonly publicarEventoPort;
    constructor(obtenerCitaPort: ObtenerCitaPort, guardarCitaPort: GuardarCitaPort, publicarEventoPort: PublicarEventoPort);
    execute(command: ConfirmarCitaCommand): Promise<Result<Cita>>;
}

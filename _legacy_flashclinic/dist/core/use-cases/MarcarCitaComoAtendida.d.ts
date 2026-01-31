import { Cita } from "../domain/entities/Cita";
import { PublicarEventoPort } from "../ports/PublicarEventoPort";
import { ObtenerCitaPort } from "../ports/ObtenerCitaPort";
import { GuardarCitaPort } from "../ports/GuardarCitaPort";
export interface MarcarCitaComoAtendidaCommand {
    citaId: string;
}
export type Result<T> = {
    ok: true;
    value: T;
} | {
    ok: false;
    error: string;
};
export declare class MarcarCitaComoAtendida {
    private readonly obtenerCitaPort;
    private readonly guardarCitaPort;
    private readonly publicarEventoPort;
    constructor(obtenerCitaPort: ObtenerCitaPort, guardarCitaPort: GuardarCitaPort, publicarEventoPort: PublicarEventoPort);
    execute(command: MarcarCitaComoAtendidaCommand): Promise<Result<Cita>>;
}

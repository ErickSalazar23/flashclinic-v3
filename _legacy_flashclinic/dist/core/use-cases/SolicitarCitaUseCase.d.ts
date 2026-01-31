import { Cita } from "../domain/entities/Cita";
import { PublicarEventoPort } from "../ports/PublicarEventoPort";
import { GuardarPendingDecisionPort } from "../ports/GuardarPendingDecisionPort";
export interface SolicitarCitaCommand {
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
    error: string;
} | {
    ok: false;
    estado: "criterio_pendiente";
    pendingDecisionId: string;
};
export declare class SolicitarCitaUseCase {
    private readonly publicarEventoPort;
    private readonly guardarPendingDecisionPort;
    private readonly decisionEngine;
    constructor(publicarEventoPort: PublicarEventoPort, guardarPendingDecisionPort: GuardarPendingDecisionPort);
    execute(command: SolicitarCitaCommand): Promise<Result<Cita>>;
}

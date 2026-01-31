import { Cita } from "../domain/entities/Cita";
import { ObtenerPendingDecisionPort } from "../ports/ObtenerPendingDecisionPort";
import { EliminarPendingDecisionPort } from "../ports/EliminarPendingDecisionPort";
import { ObtenerCitaPort } from "../ports/ObtenerCitaPort";
import { GuardarCitaPort } from "../ports/GuardarCitaPort";
import { PublicarEventoPort } from "../ports/PublicarEventoPort";
export interface AprobarSolicitudCitaCommand {
    decisionId: string;
}
export type AprobarSolicitudCitaResult = {
    ok: true;
    value: Cita;
} | {
    ok: false;
    error: string;
} | {
    ok: false;
    estado: "ya_aprobada";
    error: string;
};
export declare class AprobarSolicitudCita {
    private readonly obtenerPendingDecisionPort;
    private readonly eliminarPendingDecisionPort;
    private readonly obtenerCitaPort;
    private readonly guardarCitaPort;
    private readonly publicarEventoPort;
    constructor(obtenerPendingDecisionPort: ObtenerPendingDecisionPort, eliminarPendingDecisionPort: EliminarPendingDecisionPort, obtenerCitaPort: ObtenerCitaPort, guardarCitaPort: GuardarCitaPort, publicarEventoPort: PublicarEventoPort);
    execute(command: AprobarSolicitudCitaCommand): Promise<AprobarSolicitudCitaResult>;
}

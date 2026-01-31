import { Cita, EstadoCita } from "../domain/entities/Cita";
import { ConfirmarCita } from "./ConfirmarCita";
import { CancelarCita } from "./CancelarCita";
import { MarcarCitaComoAtendida } from "./MarcarCitaComoAtendida";
import { RegistrarNoAsistencia } from "./RegistrarNoAsistencia";
export interface ActualizarEstadoCitaCommand {
    citaId: string;
    nuevoEstado: EstadoCita;
}
export type Result<T> = {
    ok: true;
    value: T;
} | {
    ok: false;
    error: string;
};
export declare class ActualizarEstadoCita {
    private readonly confirmarCita;
    private readonly cancelarCita;
    private readonly marcarAtendida;
    private readonly registrarNoAsistencia;
    constructor(confirmarCita: ConfirmarCita, cancelarCita: CancelarCita, marcarAtendida: MarcarCitaComoAtendida, registrarNoAsistencia: RegistrarNoAsistencia);
    execute(command: ActualizarEstadoCitaCommand): Promise<Result<Cita>>;
}

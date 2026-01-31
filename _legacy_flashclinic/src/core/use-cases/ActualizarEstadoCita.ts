import { Cita, EstadoCita } from "../domain/entities/Cita";
import { ConfirmarCita } from "./ConfirmarCita";
import { CancelarCita } from "./CancelarCita";
import { MarcarCitaComoAtendida } from "./MarcarCitaComoAtendida";
import { RegistrarNoAsistencia } from "./RegistrarNoAsistencia";

export interface ActualizarEstadoCitaCommand {
  citaId: string;
  nuevoEstado: EstadoCita;
}

export type Result<T> = { ok: true; value: T } | { ok: false; error: string };

export class ActualizarEstadoCita {
  constructor(
    private readonly confirmarCita: ConfirmarCita,
    private readonly cancelarCita: CancelarCita,
    private readonly marcarAtendida: MarcarCitaComoAtendida,
    private readonly registrarNoAsistencia: RegistrarNoAsistencia
  ) {}

  async execute(command: ActualizarEstadoCitaCommand): Promise<Result<Cita>> {
    switch (command.nuevoEstado) {
      case "Confirmada":
        return this.confirmarCita.execute({ citaId: command.citaId });
      case "Cancelada":
        return this.cancelarCita.execute({ citaId: command.citaId });
      case "Atendida":
        return this.marcarAtendida.execute({ citaId: command.citaId });
      case "NoAsistió":
        return this.registrarNoAsistencia.execute({ citaId: command.citaId });
      case "Reprogramada":
        return {
          ok: false,
          error: "Use POST /citas/reprogramar con nueva fecha",
        };
      case "Solicitada":
        return {
          ok: false,
          error: "No se puede transicionar al estado Solicitada",
        };
      default:
        return { ok: false, error: `Estado no válido: ${command.nuevoEstado}` };
    }
  }
}

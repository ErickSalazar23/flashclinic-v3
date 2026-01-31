import { Cita } from "../domain/entities/Cita";
import { CitaCancelada } from "../domain/events/CitaCancelada";
import { EstadoCitaCambiado } from "../domain/events/EstadoCitaCambiado";
import { PublicarEventoPort } from "../ports/PublicarEventoPort";
import { ObtenerCitaPort } from "../ports/ObtenerCitaPort";
import { GuardarCitaPort } from "../ports/GuardarCitaPort";

export interface CancelarCitaCommand {
  citaId: string;
}

export type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

export class CancelarCita {
  private readonly obtenerCitaPort: ObtenerCitaPort;
  private readonly guardarCitaPort: GuardarCitaPort;
  private readonly publicarEventoPort: PublicarEventoPort;

  constructor(
    obtenerCitaPort: ObtenerCitaPort,
    guardarCitaPort: GuardarCitaPort,
    publicarEventoPort: PublicarEventoPort
  ) {
    this.obtenerCitaPort = obtenerCitaPort;
    this.guardarCitaPort = guardarCitaPort;
    this.publicarEventoPort = publicarEventoPort;
  }

  async execute(command: CancelarCitaCommand): Promise<Result<Cita>> {
    try {
      const citaExistente = await this.obtenerCitaPort.obtenerPorId(
        command.citaId
      );

      if (!citaExistente) {
        return {
          ok: false,
          error: `No se encontró la cita con id: ${command.citaId}`,
        };
      }

      const ahora = new Date();

      const {
        eventoCancelada,
        eventoEstadoCambiado,
        nuevaCita,
      } = citaExistente.cancelar(ahora);

      await this.publicarEventoPort.publicar(eventoCancelada);
      await this.publicarEventoPort.publicar(eventoEstadoCambiado);
      await this.guardarCitaPort.guardar(nuevaCita);

      return {
        ok: true,
        value: nuevaCita,
      };
    } catch (error: unknown) {
      let mensaje = "Error desconocido al cancelar la cita";
      if (error instanceof Error && error.message) {
        mensaje = error.message;
      }

      return {
        ok: false,
        error: mensaje,
      };
    }
  }
}

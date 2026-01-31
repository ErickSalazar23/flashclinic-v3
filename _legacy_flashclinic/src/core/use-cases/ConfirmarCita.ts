import { Cita } from "../domain/entities/Cita";
import { EstadoCitaCambiado } from "../domain/events/EstadoCitaCambiado";
import { PublicarEventoPort } from "../ports/PublicarEventoPort";
import { ObtenerCitaPort } from "../ports/ObtenerCitaPort";
import { GuardarCitaPort } from "../ports/GuardarCitaPort";

export interface ConfirmarCitaCommand {
  citaId: string;
}

export type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

export class ConfirmarCita {
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

  async execute(command: ConfirmarCitaCommand): Promise<Result<Cita>> {
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

      if (citaExistente.estado !== "Solicitada") {
        return {
          ok: false,
          error: `Solo se puede confirmar una cita en estado Solicitada. Estado actual: ${citaExistente.estado}`,
        };
      }

      const ahora = new Date();

      const { evento, nuevaCita } = citaExistente.cambiarEstado(
        "Confirmada",
        ahora
      );

      await this.publicarEventoPort.publicar(evento);
      await this.guardarCitaPort.guardar(nuevaCita);

      return {
        ok: true,
        value: nuevaCita,
      };
    } catch (error: unknown) {
      let mensaje = "Error desconocido al confirmar la cita";
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

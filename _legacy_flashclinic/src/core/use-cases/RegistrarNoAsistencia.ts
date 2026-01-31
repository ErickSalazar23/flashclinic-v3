import { Cita } from "../domain/entities/Cita";
import { PublicarEventoPort } from "../ports/PublicarEventoPort";
import { ObtenerCitaPort } from "../ports/ObtenerCitaPort";
import { GuardarCitaPort } from "../ports/GuardarCitaPort";

export interface RegistrarNoAsistenciaCommand {
  citaId: string;
}

export type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

export class RegistrarNoAsistencia {
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

  async execute(command: RegistrarNoAsistenciaCommand): Promise<Result<Cita>> {
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

      if (citaExistente.estado !== "Confirmada") {
        return {
          ok: false,
          error: `Solo se puede registrar no asistencia en una cita en estado Confirmada. Estado actual: ${citaExistente.estado}`,
        };
      }

      const ahora = new Date();

      const { evento, nuevaCita } = citaExistente.cambiarEstado(
        "NoAsistió",
        ahora
      );

      await this.publicarEventoPort.publicar(evento);
      await this.guardarCitaPort.guardar(nuevaCita);

      return {
        ok: true,
        value: nuevaCita,
      };
    } catch (error: unknown) {
      let mensaje = "Error desconocido al registrar no asistencia";
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

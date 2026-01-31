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

export type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

export class SobrescribirPrioridadCita {
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

  async execute(command: SobrescribirPrioridadCitaCommand): Promise<Result<Cita>> {
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

      const { evento, nuevaCita } = citaExistente.sobrescribirPrioridad(
        command.nuevaPrioridad,
        command.justificacion,
        command.modificadoPor,
        ahora
      );

      await this.publicarEventoPort.publicar(evento);
      await this.guardarCitaPort.guardar(nuevaCita);

      return {
        ok: true,
        value: nuevaCita,
      };
    } catch (error: unknown) {
      let mensaje = "Error desconocido al sobrescribir la prioridad";
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

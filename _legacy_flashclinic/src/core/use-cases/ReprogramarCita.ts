import { Cita } from "../domain/entities/Cita";
import { CitaReprogramada } from "../domain/events/CitaReprogramada";
import { CitaSolicitada } from "../domain/events/CitaSolicitada";
import { PublicarEventoPort } from "../ports/PublicarEventoPort";
import { ObtenerCitaPort } from "../ports/ObtenerCitaPort";
import { GuardarCitaPort } from "../ports/GuardarCitaPort";

export interface ReprogramarCitaCommand {
  citaId: string;
  nuevaCitaId: string;
  nuevaFechaHora: Date;
}

export interface ReprogramarCitaResultado {
  citaOriginal: Cita;
  citaNueva: Cita;
}

export type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

export class ReprogramarCita {
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

  async execute(
    command: ReprogramarCitaCommand
  ): Promise<Result<ReprogramarCitaResultado>> {
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
          error: `Solo se puede reprogramar una cita en estado Confirmada. Estado actual: ${citaExistente.estado}`,
        };
      }

      const ahora = new Date();

      const { evento: eventoEstadoCambiado, nuevaCita: citaOriginalActualizada } =
        citaExistente.cambiarEstado("Reprogramada", ahora);

      const eventoReprogramada = new CitaReprogramada({
        citaId: citaExistente.id,
        fechaHoraAnterior: citaExistente.fechaHora,
        fechaHoraNueva: command.nuevaFechaHora,
        ocurrioEn: ahora,
      });

      const citaNueva = new Cita({
        id: command.nuevaCitaId,
        pacienteId: citaExistente.pacienteId,
        especialidad: citaExistente.especialidad,
        fechaHora: command.nuevaFechaHora,
        prioridadInicial: citaExistente.prioridad,
        creadoEn: ahora,
      });

      const eventoCitaSolicitada = new CitaSolicitada({
        citaId: citaNueva.id,
        pacienteId: citaNueva.pacienteId,
        especialidad: citaNueva.especialidad,
        fechaHora: citaNueva.fechaHora,
        prioridad: citaNueva.prioridad,
        ocurrioEn: ahora,
      });

      await this.publicarEventoPort.publicar(eventoEstadoCambiado);
      await this.publicarEventoPort.publicar(eventoReprogramada);
      await this.publicarEventoPort.publicar(eventoCitaSolicitada);

      await this.guardarCitaPort.guardar(citaOriginalActualizada);
      await this.guardarCitaPort.guardar(citaNueva);

      return {
        ok: true,
        value: {
          citaOriginal: citaOriginalActualizada,
          citaNueva: citaNueva,
        },
      };
    } catch (error: unknown) {
      let mensaje = "Error desconocido al reprogramar la cita";
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

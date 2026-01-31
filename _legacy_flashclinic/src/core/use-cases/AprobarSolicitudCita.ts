import { Cita, PrioridadCita } from "../domain/entities/Cita";
import { CitaSolicitada } from "../domain/events/CitaSolicitada";
import { HistorialEstado } from "../domain/value-objects/HistorialEstado";
import { HistorialPrioridad } from "../domain/value-objects/HistorialPrioridad";
import { ObtenerPendingDecisionPort } from "../ports/ObtenerPendingDecisionPort";
import { EliminarPendingDecisionPort } from "../ports/EliminarPendingDecisionPort";
import { ObtenerCitaPort } from "../ports/ObtenerCitaPort";
import { GuardarCitaPort } from "../ports/GuardarCitaPort";
import { PublicarEventoPort } from "../ports/PublicarEventoPort";

export interface AprobarSolicitudCitaCommand {
  decisionId: string;
}

export type AprobarSolicitudCitaResult =
  | { ok: true; value: Cita }
  | { ok: false; error: string }
  | { ok: false; estado: "ya_aprobada"; error: string };

interface SolicitudCitaMetadata {
  id: string;
  pacienteId: string;
  especialidad: string;
  fechaHora: string;
}

export class AprobarSolicitudCita {
  constructor(
    private readonly obtenerPendingDecisionPort: ObtenerPendingDecisionPort,
    private readonly eliminarPendingDecisionPort: EliminarPendingDecisionPort,
    private readonly obtenerCitaPort: ObtenerCitaPort,
    private readonly guardarCitaPort: GuardarCitaPort,
    private readonly publicarEventoPort: PublicarEventoPort
  ) {}

  async execute(
    command: AprobarSolicitudCitaCommand
  ): Promise<AprobarSolicitudCitaResult> {
    try {
      const pendingDecision = await this.obtenerPendingDecisionPort.obtenerPorId(
        command.decisionId
      );

      if (!pendingDecision) {
        return {
          ok: false,
          error: `Decisión pendiente no encontrada: ${command.decisionId}`,
        };
      }

      const context = pendingDecision.decisionContext;
      const metadata = context.metadata as
        | { solicitudCita?: SolicitudCitaMetadata }
        | undefined;

      if (!metadata?.solicitudCita) {
        return {
          ok: false,
          error: "La decisión pendiente no contiene datos de solicitud de cita",
        };
      }

      const solicitud = metadata.solicitudCita;

      // Idempotency check: verify cita doesn't already exist
      const citaExistente = await this.obtenerCitaPort.obtenerPorId(solicitud.id);
      if (citaExistente) {
        return {
          ok: false,
          estado: "ya_aprobada",
          error: "La solicitud de cita ya fue aprobada previamente",
        };
      }

      const decisionResult = pendingDecision.decisionResult;

      const prioridad = decisionResult.recomendacionPrincipal?.valor as
        | PrioridadCita
        | undefined;

      if (!prioridad) {
        return {
          ok: false,
          error: "No se pudo determinar la prioridad de la cita",
        };
      }

      const ahora = new Date();
      const fechaHora = new Date(solicitud.fechaHora);

      const historialEstado = new HistorialEstado([
        {
          estado: "Confirmada",
          ocurrioEn: ahora,
        },
      ]);

      const historialPrioridad = new HistorialPrioridad([
        {
          prioridad: prioridad,
          origen: "Sistema",
          ocurrioEn: ahora,
        },
      ]);

      const cita = new Cita({
        id: solicitud.id,
        pacienteId: solicitud.pacienteId,
        especialidad: solicitud.especialidad,
        fechaHora: fechaHora,
        prioridadInicial: prioridad,
        creadoEn: ahora,
        historialEstado,
        historialPrioridad,
      });

      const evento = new CitaSolicitada({
        citaId: cita.id,
        pacienteId: cita.pacienteId,
        especialidad: cita.especialidad,
        fechaHora: cita.fechaHora,
        prioridad: cita.prioridad,
        ocurrioEn: ahora,
      });

      await this.guardarCitaPort.guardar(cita);
      await this.publicarEventoPort.publicar(evento);
      await this.eliminarPendingDecisionPort.eliminar(command.decisionId);

      return {
        ok: true,
        value: cita,
      };
    } catch (error: unknown) {
      let mensaje = "Error desconocido al aprobar la solicitud de cita";
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

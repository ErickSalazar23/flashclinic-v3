import { Cita, PrioridadCita } from "../domain/entities/Cita";
import { CitaSolicitada } from "../domain/events/CitaSolicitada";
import { PendingDecision } from "../domain/entities/PendingDecision";
import { PublicarEventoPort } from "../ports/PublicarEventoPort";
import { GuardarPendingDecisionPort } from "../ports/GuardarPendingDecisionPort";
import { DecisionEngine } from "../decision-engine/DecisionEngine";
import { DecisionContext } from "../decision-engine/DecisionContext";
import { AutonomyLevel } from "../decision-engine/AutonomyLevel";

export interface SolicitarCitaCommand {
  id: string;
  pacienteId: string;
  especialidad: string;
  fechaHora: Date;
  motivo: string;
  edad: number;
  tiempoEsperaDias: number;
}

export type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: string }
  | { ok: false; estado: "criterio_pendiente"; pendingDecisionId: string };

export class SolicitarCitaUseCase {
  private readonly publicarEventoPort: PublicarEventoPort;
  private readonly guardarPendingDecisionPort: GuardarPendingDecisionPort;
  private readonly decisionEngine: DecisionEngine;

  constructor(
    publicarEventoPort: PublicarEventoPort,
    guardarPendingDecisionPort: GuardarPendingDecisionPort
  ) {
    this.publicarEventoPort = publicarEventoPort;
    this.guardarPendingDecisionPort = guardarPendingDecisionPort;
    this.decisionEngine = new DecisionEngine();
  }

  async execute(command: SolicitarCitaCommand): Promise<Result<Cita>> {
    try {
      const contexto: DecisionContext = {
        tipo: "prioridad_cita",
        datos: {
          motivo: command.motivo,
          edad: command.edad,
          tiempoEsperaDias: command.tiempoEsperaDias,
        },
        metadata: {
          solicitudCita: {
            id: command.id,
            pacienteId: command.pacienteId,
            especialidad: command.especialidad,
            fechaHora: command.fechaHora.toISOString(),
          },
        },
      };

      const decisionResult = this.decisionEngine.evaluar(contexto);

      if (!decisionResult.recomendacionPrincipal) {
        return {
          ok: false,
          error:
            decisionResult.razonIntervencion ||
            "No se pudo determinar la prioridad de la cita",
        };
      }

      if (
        decisionResult.autonomyLevel === "BLOCKED" ||
        decisionResult.autonomyLevel === "SUPERVISED"
      ) {
        const ahora = new Date();
        const pendingDecisionId = `pending-${command.id}-${ahora.getTime()}`;

        const pendingDecision = new PendingDecision({
          id: pendingDecisionId,
          decisionContext: contexto,
          decisionResult: decisionResult,
          autonomyLevel: decisionResult.autonomyLevel,
          razon:
            decisionResult.razonIntervencion ||
            `Decisión ${decisionResult.autonomyLevel} que requiere intervención`,
          creadoEn: ahora,
        });

        await this.guardarPendingDecisionPort.guardar(pendingDecision);

        return {
          ok: false,
          estado: "criterio_pendiente",
          pendingDecisionId: pendingDecision.id,
        };
      }

      const prioridad = decisionResult.recomendacionPrincipal
        .valor as PrioridadCita;

      const ahora = new Date();

      const cita = new Cita({
        id: command.id,
        pacienteId: command.pacienteId,
        especialidad: command.especialidad,
        fechaHora: command.fechaHora,
        prioridadInicial: prioridad,
        creadoEn: ahora,
      });

      const evento = new CitaSolicitada({
        citaId: cita.id,
        pacienteId: cita.pacienteId,
        especialidad: cita.especialidad,
        fechaHora: cita.fechaHora,
        prioridad: cita.prioridad,
        ocurrioEn: ahora,
      });

      await this.publicarEventoPort.publicar(evento);

      return {
        ok: true,
        value: cita,
      };
    } catch (error: unknown) {
      let mensaje = "Error desconocido al solicitar la cita";
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


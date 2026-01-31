import { Cita, PrioridadCita } from "../domain/entities/Cita";
import { GuardarCitaPort } from "../ports/GuardarCitaPort";
import { DecisionEngine } from "../decision-engine/DecisionEngine";
import { DecisionContext } from "../decision-engine/DecisionContext";

export interface AgendarCitaCommand {
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
  | { ok: false; error: Error };

export class AgendarCita {
  private readonly guardarCitaPort: GuardarCitaPort;
  private readonly decisionEngine: DecisionEngine;

  constructor(guardarCitaPort: GuardarCitaPort) {
    this.guardarCitaPort = guardarCitaPort;
    this.decisionEngine = new DecisionEngine();
  }

  async execute(command: AgendarCitaCommand): Promise<Result<Cita>> {
    try {
      const contexto: DecisionContext = {
        tipo: "prioridad_cita",
        datos: {
          motivo: command.motivo,
          edad: command.edad,
          tiempoEsperaDias: command.tiempoEsperaDias,
        },
      };

      const decisionResult = this.decisionEngine.evaluar(contexto);

      if (!decisionResult.recomendacionPrincipal) {
        const err =
          decisionResult.razonIntervencion ||
          new Error("No se pudo determinar la prioridad de la cita");

        return {
          ok: false,
          error: err instanceof Error ? err : new Error(err),
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

      await this.guardarCitaPort.guardar(cita);

      return {
        ok: true,
        value: cita,
      };
    } catch (error: unknown) {
      const err =
        error instanceof Error
          ? error
          : new Error("Error desconocido al agendar la cita");

      return {
        ok: false,
        error: err,
      };
    }
  }
}


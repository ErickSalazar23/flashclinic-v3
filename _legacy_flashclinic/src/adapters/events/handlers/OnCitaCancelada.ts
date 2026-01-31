import { DomainEventHandler } from "../DomainEventHandler";
import { CitaCancelada } from "../../../core/domain/events/CitaCancelada";

export class OnCitaCancelada implements DomainEventHandler<CitaCancelada> {
  readonly eventType = "CitaCancelada";

  async handle(event: CitaCancelada): Promise<void> {
    console.warn(`[ALERT] Cita cancelada - Requiere atención:`);
    console.warn(`  - Cita ID: ${event.citaId}`);
    console.warn(`  - Paciente ID: ${event.pacienteId}`);
    console.warn(`  - Timestamp: ${event.ocurrioEn.toISOString()}`);

    console.log(`[AUDIT] Registro de cancelación:`);
    console.log(
      JSON.stringify(
        {
          type: "CITA_CANCELADA",
          citaId: event.citaId,
          pacienteId: event.pacienteId,
          timestamp: event.ocurrioEn.toISOString(),
          severity: "HIGH",
        },
        null,
        2
      )
    );
  }
}

import { DomainEventHandler } from "../DomainEventHandler";
import { CitaSolicitada } from "../../../core/domain/events/CitaSolicitada";

export class OnCitaSolicitada implements DomainEventHandler<CitaSolicitada> {
  readonly eventType = "CitaSolicitada";

  async handle(event: CitaSolicitada): Promise<void> {
    console.log(`[EMAIL] Enviando notificación de cita solicitada:`);
    console.log(`  - Cita ID: ${event.citaId}`);
    console.log(`  - Paciente ID: ${event.pacienteId}`);
    console.log(`  - Especialidad: ${event.especialidad}`);
    console.log(`  - Fecha/Hora: ${event.fechaHora.toISOString()}`);
    console.log(`  - Prioridad: ${event.prioridad}`);
    console.log(`  - Timestamp: ${event.ocurrioEn.toISOString()}`);
  }
}

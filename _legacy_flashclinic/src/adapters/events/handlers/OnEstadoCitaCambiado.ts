import { DomainEventHandler } from "../DomainEventHandler";
import { EstadoCitaCambiado } from "../../../core/domain/events/EstadoCitaCambiado";

export class OnEstadoCitaCambiado implements DomainEventHandler<EstadoCitaCambiado> {
  readonly eventType = "EstadoCitaCambiado";

  async handle(event: EstadoCitaCambiado): Promise<void> {
    const severity = this.getSeverity(event.estadoNuevo);

    console.log(`[STATE] Cambio de estado en cita:`);
    console.log(`  - Cita ID: ${event.citaId}`);
    console.log(`  - Estado anterior: ${event.estadoAnterior}`);
    console.log(`  - Estado nuevo: ${event.estadoNuevo}`);
    console.log(`  - Timestamp: ${event.ocurrioEn.toISOString()}`);

    console.log(`[AUDIT] Registro de cambio de estado:`);
    console.log(
      JSON.stringify(
        {
          type: "ESTADO_CITA_CAMBIADO",
          citaId: event.citaId,
          estadoAnterior: event.estadoAnterior,
          estadoNuevo: event.estadoNuevo,
          timestamp: event.ocurrioEn.toISOString(),
          severity,
        },
        null,
        2
      )
    );
  }

  private getSeverity(estadoNuevo: string): string {
    switch (estadoNuevo) {
      case "Cancelada":
      case "NoAsistió":
        return "HIGH";
      case "Atendida":
        return "LOW";
      default:
        return "MEDIUM";
    }
  }
}

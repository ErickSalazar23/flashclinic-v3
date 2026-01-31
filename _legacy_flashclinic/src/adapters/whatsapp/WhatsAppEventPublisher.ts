// Adapter de infraestructura que traduce eventos de dominio a mensajes de WhatsApp
// NO contiene lógica de negocio, solo ejecuta la traducción y el envío

import {
  DomainEvent,
  PublicarEventoPort,
} from "../../core/ports/PublicarEventoPort";
import { CitaSolicitada } from "../../core/domain/events/CitaSolicitada";

export class WhatsAppEventPublisher implements PublicarEventoPort {
  async publicar(evento: DomainEvent): Promise<void> {
    if (!(evento instanceof CitaSolicitada)) {
      return;
    }

    const mensaje = this.construirMensaje(evento);
    this.simularEnvioWhatsApp(mensaje, evento.pacienteId);
  }

  private construirMensaje(evento: CitaSolicitada): string {
    const fechaHora = evento.fechaHora.toLocaleString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    return `Hola! Tu cita médica ha sido solicitada exitosamente.\n\n` +
      `Especialidad: ${evento.especialidad}\n` +
      `Fecha y hora: ${fechaHora}\n` +
      `Prioridad: ${evento.prioridad}\n\n` +
      `Te confirmaremos la cita próximamente.`;
  }

  private simularEnvioWhatsApp(mensaje: string, pacienteId: string): void {
    console.log(`[WhatsApp] Enviando mensaje a paciente ${pacienteId}:`);
    console.log(mensaje);
  }
}

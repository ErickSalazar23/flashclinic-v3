"use strict";
// Adapter de infraestructura que traduce eventos de dominio a mensajes de WhatsApp
// NO contiene lógica de negocio, solo ejecuta la traducción y el envío
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppEventPublisher = void 0;
const CitaSolicitada_1 = require("../../core/domain/events/CitaSolicitada");
class WhatsAppEventPublisher {
    async publicar(evento) {
        if (!(evento instanceof CitaSolicitada_1.CitaSolicitada)) {
            return;
        }
        const mensaje = this.construirMensaje(evento);
        this.simularEnvioWhatsApp(mensaje, evento.pacienteId);
    }
    construirMensaje(evento) {
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
    simularEnvioWhatsApp(mensaje, pacienteId) {
        console.log(`[WhatsApp] Enviando mensaje a paciente ${pacienteId}:`);
        console.log(mensaje);
    }
}
exports.WhatsAppEventPublisher = WhatsAppEventPublisher;

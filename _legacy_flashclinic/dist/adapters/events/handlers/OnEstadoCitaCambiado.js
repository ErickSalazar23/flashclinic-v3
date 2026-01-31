"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnEstadoCitaCambiado = void 0;
class OnEstadoCitaCambiado {
    constructor() {
        this.eventType = "EstadoCitaCambiado";
    }
    async handle(event) {
        const severity = this.getSeverity(event.estadoNuevo);
        console.log(`[STATE] Cambio de estado en cita:`);
        console.log(`  - Cita ID: ${event.citaId}`);
        console.log(`  - Estado anterior: ${event.estadoAnterior}`);
        console.log(`  - Estado nuevo: ${event.estadoNuevo}`);
        console.log(`  - Timestamp: ${event.ocurrioEn.toISOString()}`);
        console.log(`[AUDIT] Registro de cambio de estado:`);
        console.log(JSON.stringify({
            type: "ESTADO_CITA_CAMBIADO",
            citaId: event.citaId,
            estadoAnterior: event.estadoAnterior,
            estadoNuevo: event.estadoNuevo,
            timestamp: event.ocurrioEn.toISOString(),
            severity,
        }, null, 2));
    }
    getSeverity(estadoNuevo) {
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
exports.OnEstadoCitaCambiado = OnEstadoCitaCambiado;

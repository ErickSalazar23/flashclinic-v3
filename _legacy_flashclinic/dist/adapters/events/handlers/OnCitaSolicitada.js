"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnCitaSolicitada = void 0;
class OnCitaSolicitada {
    constructor() {
        this.eventType = "CitaSolicitada";
    }
    async handle(event) {
        console.log(`[EMAIL] Enviando notificación de cita solicitada:`);
        console.log(`  - Cita ID: ${event.citaId}`);
        console.log(`  - Paciente ID: ${event.pacienteId}`);
        console.log(`  - Especialidad: ${event.especialidad}`);
        console.log(`  - Fecha/Hora: ${event.fechaHora.toISOString()}`);
        console.log(`  - Prioridad: ${event.prioridad}`);
        console.log(`  - Timestamp: ${event.ocurrioEn.toISOString()}`);
    }
}
exports.OnCitaSolicitada = OnCitaSolicitada;

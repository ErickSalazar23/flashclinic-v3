"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnCitaCancelada = void 0;
class OnCitaCancelada {
    constructor() {
        this.eventType = "CitaCancelada";
    }
    async handle(event) {
        console.warn(`[ALERT] Cita cancelada - Requiere atención:`);
        console.warn(`  - Cita ID: ${event.citaId}`);
        console.warn(`  - Paciente ID: ${event.pacienteId}`);
        console.warn(`  - Timestamp: ${event.ocurrioEn.toISOString()}`);
        console.log(`[AUDIT] Registro de cancelación:`);
        console.log(JSON.stringify({
            type: "CITA_CANCELADA",
            citaId: event.citaId,
            pacienteId: event.pacienteId,
            timestamp: event.ocurrioEn.toISOString(),
            severity: "HIGH",
        }, null, 2));
    }
}
exports.OnCitaCancelada = OnCitaCancelada;

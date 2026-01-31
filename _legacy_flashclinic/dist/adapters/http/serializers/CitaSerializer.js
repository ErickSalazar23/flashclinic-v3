"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeCita = serializeCita;
function serializeCita(cita) {
    return {
        id: cita.id,
        pacienteId: cita.pacienteId,
        especialidad: cita.especialidad,
        fechaHora: cita.fechaHora.toISOString(),
        estado: cita.estado,
        prioridad: cita.prioridad,
        creadoEn: cita.creadoEn.toISOString(),
    };
}

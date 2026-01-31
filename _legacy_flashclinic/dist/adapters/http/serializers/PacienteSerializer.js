"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializePaciente = serializePaciente;
function serializePaciente(paciente) {
    return {
        id: paciente.id,
        nombre: paciente.nombre,
        telefono: paciente.telefono,
        fechaNacimiento: paciente.fechaNacimiento.toISOString(),
        esRecurrente: paciente.esRecurrente,
    };
}

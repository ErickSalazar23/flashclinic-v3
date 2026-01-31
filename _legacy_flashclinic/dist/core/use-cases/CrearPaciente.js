"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrearPaciente = void 0;
const Paciente_1 = require("../domain/entities/Paciente");
class CrearPaciente {
    constructor(obtenerPacientePort, guardarPacientePort) {
        this.obtenerPacientePort = obtenerPacientePort;
        this.guardarPacientePort = guardarPacientePort;
    }
    async execute(command) {
        try {
            const existente = await this.obtenerPacientePort.obtenerPorId(command.id);
            if (existente) {
                return { ok: false, error: `Ya existe un paciente con id: ${command.id}` };
            }
            const paciente = new Paciente_1.Paciente(command.id, command.nombre, command.telefono, command.fechaNacimiento, command.esRecurrente ?? false);
            await this.guardarPacientePort.guardar(paciente);
            return { ok: true, value: paciente };
        }
        catch (error) {
            const mensaje = error instanceof Error
                ? error.message
                : "Error desconocido al crear paciente";
            return { ok: false, error: mensaje };
        }
    }
}
exports.CrearPaciente = CrearPaciente;

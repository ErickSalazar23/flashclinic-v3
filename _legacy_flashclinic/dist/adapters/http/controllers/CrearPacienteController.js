"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrearPacienteController = void 0;
const types_1 = require("../types");
const PacienteSerializer_1 = require("../serializers/PacienteSerializer");
class CrearPacienteController {
    constructor(useCase) {
        this.useCase = useCase;
    }
    async handle(request) {
        const body = request.body;
        if (!body.id || !body.nombre || !body.telefono || !body.fechaNacimiento) {
            return (0, types_1.badRequest)("Campos requeridos: id, nombre, telefono, fechaNacimiento");
        }
        const command = {
            id: body.id,
            nombre: body.nombre,
            telefono: body.telefono,
            fechaNacimiento: new Date(body.fechaNacimiento),
            esRecurrente: body.esRecurrente,
        };
        const resultado = await this.useCase.execute(command);
        if (resultado.ok) {
            return (0, types_1.ok)((0, PacienteSerializer_1.serializePaciente)(resultado.value));
        }
        return (0, types_1.badRequest)(resultado.error);
    }
}
exports.CrearPacienteController = CrearPacienteController;

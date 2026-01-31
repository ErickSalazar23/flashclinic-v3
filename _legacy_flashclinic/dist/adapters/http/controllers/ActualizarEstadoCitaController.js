"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActualizarEstadoCitaController = void 0;
const types_1 = require("../types");
const CitaSerializer_1 = require("../serializers/CitaSerializer");
class ActualizarEstadoCitaController {
    constructor(useCase) {
        this.useCase = useCase;
    }
    async handle(request) {
        const citaId = request.params.id;
        if (!citaId) {
            return (0, types_1.badRequest)("El id de la cita es requerido");
        }
        const body = request.body;
        if (!body.nuevoEstado) {
            return (0, types_1.badRequest)("El campo nuevoEstado es requerido");
        }
        const estadosValidos = [
            "Solicitada",
            "Confirmada",
            "Reprogramada",
            "Cancelada",
            "Atendida",
            "NoAsistió",
        ];
        if (!estadosValidos.includes(body.nuevoEstado)) {
            return (0, types_1.badRequest)(`Estado no válido. Estados permitidos: ${estadosValidos.join(", ")}`);
        }
        const command = {
            citaId,
            nuevoEstado: body.nuevoEstado,
        };
        const resultado = await this.useCase.execute(command);
        if (resultado.ok) {
            return (0, types_1.ok)((0, CitaSerializer_1.serializeCita)(resultado.value));
        }
        if (resultado.error.includes("No se encontró")) {
            return (0, types_1.notFound)(resultado.error);
        }
        return (0, types_1.badRequest)(resultado.error);
    }
}
exports.ActualizarEstadoCitaController = ActualizarEstadoCitaController;

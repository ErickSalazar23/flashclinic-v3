"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SolicitarCitaController = void 0;
const types_1 = require("../types");
const CitaSerializer_1 = require("../serializers/CitaSerializer");
class SolicitarCitaController {
    constructor(useCase) {
        this.useCase = useCase;
    }
    async handle(request) {
        const body = request.body;
        const command = {
            id: body.id ?? "",
            pacienteId: body.pacienteId ?? "",
            especialidad: body.especialidad ?? "",
            fechaHora: new Date(body.fechaHora ?? ""),
            motivo: body.motivo ?? "",
            edad: body.edad ?? 0,
            tiempoEsperaDias: body.tiempoEsperaDias ?? 0,
        };
        const resultado = await this.useCase.execute(command);
        if (resultado.ok) {
            return (0, types_1.ok)((0, CitaSerializer_1.serializeCita)(resultado.value));
        }
        if ("estado" in resultado) {
            return (0, types_1.badRequest)(`Decisión pendiente de aprobación: ${resultado.pendingDecisionId}`);
        }
        return (0, types_1.badRequest)(resultado.error);
    }
}
exports.SolicitarCitaController = SolicitarCitaController;

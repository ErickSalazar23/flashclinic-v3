"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AprobarSolicitudCitaController = void 0;
const types_1 = require("../types");
const CitaSerializer_1 = require("../serializers/CitaSerializer");
class AprobarSolicitudCitaController {
    constructor(useCase) {
        this.useCase = useCase;
    }
    async handle(request) {
        const body = request.body;
        if (!body.decisionId) {
            return (0, types_1.badRequest)("El campo decisionId es requerido");
        }
        const command = {
            decisionId: body.decisionId,
        };
        const resultado = await this.useCase.execute(command);
        if (resultado.ok) {
            return (0, types_1.ok)((0, CitaSerializer_1.serializeCita)(resultado.value));
        }
        if ("estado" in resultado && resultado.estado === "ya_aprobada") {
            return (0, types_1.conflict)(resultado.error);
        }
        return (0, types_1.badRequest)(resultado.error);
    }
}
exports.AprobarSolicitudCitaController = AprobarSolicitudCitaController;

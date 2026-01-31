"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SobrescribirPrioridadCitaController = void 0;
const types_1 = require("../types");
const CitaSerializer_1 = require("../serializers/CitaSerializer");
class SobrescribirPrioridadCitaController {
    constructor(useCase) {
        this.useCase = useCase;
    }
    async handle(request) {
        const body = request.body;
        const command = {
            citaId: body.citaId ?? "",
            nuevaPrioridad: (body.nuevaPrioridad ?? "Media"),
            justificacion: body.justificacion ?? "",
            modificadoPor: body.modificadoPor ?? "",
        };
        const resultado = await this.useCase.execute(command);
        if (resultado.ok) {
            return (0, types_1.ok)((0, CitaSerializer_1.serializeCita)(resultado.value));
        }
        return (0, types_1.badRequest)(resultado.error);
    }
}
exports.SobrescribirPrioridadCitaController = SobrescribirPrioridadCitaController;

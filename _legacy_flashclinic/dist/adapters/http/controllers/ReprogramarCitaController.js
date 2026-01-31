"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReprogramarCitaController = void 0;
const types_1 = require("../types");
const CitaSerializer_1 = require("../serializers/CitaSerializer");
class ReprogramarCitaController {
    constructor(useCase) {
        this.useCase = useCase;
    }
    async handle(request) {
        const body = request.body;
        const command = {
            citaId: body.citaId ?? "",
            nuevaCitaId: body.nuevaCitaId ?? "",
            nuevaFechaHora: new Date(body.nuevaFechaHora ?? ""),
        };
        const resultado = await this.useCase.execute(command);
        if (resultado.ok) {
            return (0, types_1.ok)({
                citaOriginal: (0, CitaSerializer_1.serializeCita)(resultado.value.citaOriginal),
                citaNueva: (0, CitaSerializer_1.serializeCita)(resultado.value.citaNueva),
            });
        }
        return (0, types_1.badRequest)(resultado.error);
    }
}
exports.ReprogramarCitaController = ReprogramarCitaController;

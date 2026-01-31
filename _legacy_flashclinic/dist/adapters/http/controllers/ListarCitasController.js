"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListarCitasController = void 0;
const types_1 = require("../types");
const CitaSerializer_1 = require("../serializers/CitaSerializer");
class ListarCitasController {
    constructor(useCase) {
        this.useCase = useCase;
    }
    async handle(request) {
        const query = {};
        if (request.query.pacienteId) {
            query.pacienteId = request.query.pacienteId;
        }
        if (request.query.estado) {
            query.estado = request.query.estado;
        }
        const resultado = await this.useCase.execute(query);
        if (resultado.ok) {
            return (0, types_1.ok)(resultado.value.map(CitaSerializer_1.serializeCita));
        }
        return (0, types_1.serverError)(resultado.error);
    }
}
exports.ListarCitasController = ListarCitasController;

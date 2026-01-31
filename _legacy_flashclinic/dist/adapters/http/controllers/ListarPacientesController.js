"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListarPacientesController = void 0;
const types_1 = require("../types");
const PacienteSerializer_1 = require("../serializers/PacienteSerializer");
class ListarPacientesController {
    constructor(useCase) {
        this.useCase = useCase;
    }
    async handle(request) {
        const resultado = await this.useCase.execute();
        if (resultado.ok) {
            return (0, types_1.ok)(resultado.value.map(PacienteSerializer_1.serializePaciente));
        }
        return (0, types_1.serverError)(resultado.error);
    }
}
exports.ListarPacientesController = ListarPacientesController;

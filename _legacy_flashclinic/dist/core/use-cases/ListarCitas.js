"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListarCitas = void 0;
class ListarCitas {
    constructor(listarCitasPort) {
        this.listarCitasPort = listarCitasPort;
    }
    async execute(query) {
        try {
            const citas = await this.listarCitasPort.obtenerTodas(query);
            return { ok: true, value: citas };
        }
        catch (error) {
            const mensaje = error instanceof Error
                ? error.message
                : "Error desconocido al listar citas";
            return { ok: false, error: mensaje };
        }
    }
}
exports.ListarCitas = ListarCitas;

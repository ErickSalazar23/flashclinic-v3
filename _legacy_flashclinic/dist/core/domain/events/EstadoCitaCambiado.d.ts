import { EstadoCita } from "../entities/Cita";
export declare class EstadoCitaCambiado {
    readonly citaId: string;
    readonly estadoAnterior: EstadoCita;
    readonly estadoNuevo: EstadoCita;
    readonly ocurrioEn: Date;
    constructor(params: {
        citaId: string;
        estadoAnterior: EstadoCita;
        estadoNuevo: EstadoCita;
        ocurrioEn: Date;
    });
}

import { PrioridadCita } from "../entities/Cita";
export declare class PrioridadCitaSobrescritaPorHumano {
    readonly citaId: string;
    readonly prioridadAnterior: PrioridadCita;
    readonly prioridadNueva: PrioridadCita;
    readonly justificacion: string;
    readonly modificadoPor: string;
    readonly ocurrioEn: Date;
    constructor(params: {
        citaId: string;
        prioridadAnterior: PrioridadCita;
        prioridadNueva: PrioridadCita;
        justificacion: string;
        modificadoPor: string;
        ocurrioEn: Date;
    });
}

import { PrioridadCita } from "../entities/Cita";
export declare class PrioridadCitaAsignadaPorSistema {
    readonly citaId: string;
    readonly prioridad: PrioridadCita;
    readonly ocurrioEn: Date;
    constructor(params: {
        citaId: string;
        prioridad: PrioridadCita;
        ocurrioEn: Date;
    });
}

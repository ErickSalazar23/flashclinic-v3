import { PrioridadCita } from "../entities/Cita";
export declare class CitaSolicitada {
    readonly citaId: string;
    readonly pacienteId: string;
    readonly especialidad: string;
    readonly fechaHora: Date;
    readonly prioridad: PrioridadCita;
    readonly ocurrioEn: Date;
    constructor(params: {
        citaId: string;
        pacienteId: string;
        especialidad: string;
        fechaHora: Date;
        prioridad: PrioridadCita;
        ocurrioEn: Date;
    });
}

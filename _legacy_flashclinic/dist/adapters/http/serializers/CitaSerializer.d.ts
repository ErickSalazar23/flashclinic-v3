import { Cita } from "../../../core/domain/entities/Cita";
export interface CitaDTO {
    id: string;
    pacienteId: string;
    especialidad: string;
    fechaHora: string;
    estado: string;
    prioridad: string;
    creadoEn: string;
}
export declare function serializeCita(cita: Cita): CitaDTO;

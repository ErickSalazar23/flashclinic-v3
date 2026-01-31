import { PrioridadCita } from "../entities/Cita";
export type OrigenPrioridad = "Sistema" | "Humano";
export interface PrioridadRegistro {
    readonly prioridad: PrioridadCita;
    readonly origen: OrigenPrioridad;
    readonly ocurrioEn: Date;
    readonly justificacion?: string;
    readonly modificadoPor?: string;
    readonly eventoId?: string;
}
export declare class HistorialPrioridad {
    private readonly _registros;
    constructor(registros?: PrioridadRegistro[]);
    obtenerPrioridadActual(): PrioridadCita;
    obtenerOrigenActual(): OrigenPrioridad;
    obtenerHistorialCompleto(): readonly PrioridadRegistro[];
    agregarPrioridad(registro: PrioridadRegistro): HistorialPrioridad;
    private validarOrdenCronologico;
    private validarTimestampsUnicos;
    private validarJustificacionHumana;
}

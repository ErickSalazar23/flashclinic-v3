import { EstadoCita } from "../entities/Cita";
export interface EstadoRegistro {
    readonly estado: EstadoCita;
    readonly ocurrioEn: Date;
    readonly eventoId?: string;
}
export declare class HistorialEstado {
    private readonly _registros;
    constructor(registros?: EstadoRegistro[]);
    obtenerEstadoActual(): EstadoCita;
    obtenerHistorialCompleto(): readonly EstadoRegistro[];
    agregarEstado(registro: EstadoRegistro): HistorialEstado;
    private validarOrdenCronologico;
    private validarTimestampsUnicos;
}

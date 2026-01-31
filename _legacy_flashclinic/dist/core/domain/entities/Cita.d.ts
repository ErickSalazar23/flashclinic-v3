import { HistorialEstado, EstadoRegistro } from "../value-objects/HistorialEstado";
import { HistorialPrioridad, PrioridadRegistro } from "../value-objects/HistorialPrioridad";
import { EstadoCitaCambiado } from "../events/EstadoCitaCambiado";
import { PrioridadCitaSobrescritaPorHumano } from "../events/PrioridadCitaSobrescritaPorHumano";
import { CitaReprogramada } from "../events/CitaReprogramada";
import { CitaCancelada } from "../events/CitaCancelada";
export type EstadoCita = "Solicitada" | "Confirmada" | "Reprogramada" | "Cancelada" | "Atendida" | "NoAsistió";
export type PrioridadCita = "Alta" | "Media" | "Baja";
export declare class Cita {
    private readonly _id;
    private readonly _pacienteId;
    private readonly _especialidad;
    private readonly _fechaHora;
    private readonly _creadoEn;
    private readonly _historialEstado;
    private readonly _historialPrioridad;
    constructor(params: {
        id: string;
        pacienteId: string;
        especialidad: string;
        fechaHora: Date;
        prioridadInicial: PrioridadCita;
        creadoEn: Date;
        historialEstado?: HistorialEstado;
        historialPrioridad?: HistorialPrioridad;
    });
    get id(): string;
    get pacienteId(): string;
    get especialidad(): string;
    get fechaHora(): Date;
    get creadoEn(): Date;
    get estado(): EstadoCita;
    get prioridad(): PrioridadCita;
    get historialEstado(): readonly EstadoRegistro[];
    get historialPrioridad(): readonly PrioridadRegistro[];
    cambiarEstado(nuevoEstado: EstadoCita, ocurrioEn: Date): {
        evento: EstadoCitaCambiado;
        nuevaCita: Cita;
    };
    sobrescribirPrioridad(nuevaPrioridad: PrioridadCita, justificacion: string, modificadoPor: string, ocurrioEn: Date): {
        evento: PrioridadCitaSobrescritaPorHumano;
        nuevaCita: Cita;
    };
    reprogramar(nuevaFechaHora: Date, ocurrioEn: Date): {
        eventoReprogramada: CitaReprogramada;
        eventoEstadoCambiado?: EstadoCitaCambiado;
        nuevaCita: Cita;
    };
    cancelar(ocurrioEn: Date): {
        eventoCancelada: CitaCancelada;
        eventoEstadoCambiado: EstadoCitaCambiado;
        nuevaCita: Cita;
    };
    aplicarEventoEstado(evento: EstadoCitaCambiado): Cita;
    aplicarEventoPrioridad(evento: PrioridadCitaSobrescritaPorHumano): Cita;
    private static validarId;
    private static validarPacienteId;
    private static validarEspecialidad;
    private static validarFechaHora;
    private static validarFechaCreacion;
    private static validarPrioridad;
    private static validarTransicionEstado;
}

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

export function serializeCita(cita: Cita): CitaDTO {
  return {
    id: cita.id,
    pacienteId: cita.pacienteId,
    especialidad: cita.especialidad,
    fechaHora: cita.fechaHora.toISOString(),
    estado: cita.estado,
    prioridad: cita.prioridad,
    creadoEn: cita.creadoEn.toISOString(),
  };
}

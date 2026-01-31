// Evento de dominio que registra el hecho de que una cita fue solicitada
// y habilita decisiones posteriores (confirmar, reprogramar, notificar, etc.)

import { PrioridadCita } from "../entities/Cita";

export class CitaSolicitada {
  public readonly citaId: string;
  public readonly pacienteId: string;
  public readonly especialidad: string;
  public readonly fechaHora: Date;
  public readonly prioridad: PrioridadCita;
  public readonly ocurrioEn: Date;

  constructor(params: {
    citaId: string;
    pacienteId: string;
    especialidad: string;
    fechaHora: Date;
    prioridad: PrioridadCita;
    ocurrioEn: Date;
  }) {
    this.citaId = params.citaId;
    this.pacienteId = params.pacienteId;
    this.especialidad = params.especialidad;
    this.fechaHora = new Date(params.fechaHora);
    this.prioridad = params.prioridad;
    this.ocurrioEn = params.ocurrioEn;
  }
}


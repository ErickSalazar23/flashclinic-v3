import { PrioridadCita } from "../entities/Cita";

export class PrioridadCitaAsignadaPorSistema {
  public readonly citaId: string;
  public readonly prioridad: PrioridadCita;
  public readonly ocurrioEn: Date;

  constructor(params: {
    citaId: string;
    prioridad: PrioridadCita;
    ocurrioEn: Date;
  }) {
    this.citaId = params.citaId;
    this.prioridad = params.prioridad;
    this.ocurrioEn = params.ocurrioEn;
  }
}

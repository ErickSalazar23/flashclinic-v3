import { EstadoCita } from "../entities/Cita";

export class EstadoCitaCambiado {
  public readonly citaId: string;
  public readonly estadoAnterior: EstadoCita;
  public readonly estadoNuevo: EstadoCita;
  public readonly ocurrioEn: Date;

  constructor(params: {
    citaId: string;
    estadoAnterior: EstadoCita;
    estadoNuevo: EstadoCita;
    ocurrioEn: Date;
  }) {
    this.citaId = params.citaId;
    this.estadoAnterior = params.estadoAnterior;
    this.estadoNuevo = params.estadoNuevo;
    this.ocurrioEn = params.ocurrioEn;
  }
}

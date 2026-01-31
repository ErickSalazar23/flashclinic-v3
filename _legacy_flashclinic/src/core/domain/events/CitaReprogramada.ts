export class CitaReprogramada {
  public readonly citaId: string;
  public readonly fechaHoraAnterior: Date;
  public readonly fechaHoraNueva: Date;
  public readonly ocurrioEn: Date;

  constructor(params: {
    citaId: string;
    fechaHoraAnterior: Date;
    fechaHoraNueva: Date;
    ocurrioEn: Date;
  }) {
    this.citaId = params.citaId;
    this.fechaHoraAnterior = new Date(params.fechaHoraAnterior);
    this.fechaHoraNueva = new Date(params.fechaHoraNueva);
    this.ocurrioEn = params.ocurrioEn;
  }
}

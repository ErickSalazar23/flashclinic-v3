export class CitaCancelada {
  public readonly citaId: string;
  public readonly pacienteId: string;
  public readonly ocurrioEn: Date;

  constructor(params: {
    citaId: string;
    pacienteId: string;
    ocurrioEn: Date;
  }) {
    this.citaId = params.citaId;
    this.pacienteId = params.pacienteId;
    this.ocurrioEn = params.ocurrioEn;
  }
}

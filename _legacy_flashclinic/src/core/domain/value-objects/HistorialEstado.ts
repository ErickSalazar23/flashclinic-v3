import { EstadoCita } from "../entities/Cita";

export interface EstadoRegistro {
  readonly estado: EstadoCita;
  readonly ocurrioEn: Date;
  readonly eventoId?: string;
}

export class HistorialEstado {
  private readonly _registros: EstadoRegistro[];

  constructor(registros: EstadoRegistro[] = []) {
    this.validarOrdenCronologico(registros);
    this.validarTimestampsUnicos(registros);
    this._registros = [...registros].sort(
      (a, b) => a.ocurrioEn.getTime() - b.ocurrioEn.getTime()
    );
  }

  obtenerEstadoActual(): EstadoCita {
    if (this._registros.length === 0) {
      throw new Error("El historial de estados está vacío");
    }
    return this._registros[this._registros.length - 1].estado;
  }

  obtenerHistorialCompleto(): readonly EstadoRegistro[] {
    return this._registros;
  }

  agregarEstado(registro: EstadoRegistro): HistorialEstado {
    const nuevosRegistros = [...this._registros, registro];
    return new HistorialEstado(nuevosRegistros);
  }

  private validarOrdenCronologico(registros: EstadoRegistro[]): void {
    const timestamps = registros.map((r) => r.ocurrioEn.getTime());
    const ordenados = [...timestamps].sort((a, b) => a - b);
    
    for (let i = 0; i < timestamps.length; i++) {
      if (timestamps[i] !== ordenados[i]) {
        throw new Error(
          "El historial de estados debe estar en orden cronológico"
        );
      }
    }
  }

  private validarTimestampsUnicos(registros: EstadoRegistro[]): void {
    const timestamps = registros.map((r) => r.ocurrioEn.getTime());
    const unicos = new Set(timestamps);
    
    if (timestamps.length !== unicos.size) {
      throw new Error(
        "No pueden existir múltiples estados con el mismo timestamp"
      );
    }
  }
}

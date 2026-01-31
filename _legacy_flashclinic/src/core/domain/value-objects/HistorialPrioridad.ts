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

export class HistorialPrioridad {
  private readonly _registros: PrioridadRegistro[];

  constructor(registros: PrioridadRegistro[] = []) {
    this.validarOrdenCronologico(registros);
    this.validarTimestampsUnicos(registros);
    this.validarJustificacionHumana(registros);
    this._registros = [...registros].sort(
      (a, b) => a.ocurrioEn.getTime() - b.ocurrioEn.getTime()
    );
  }

  obtenerPrioridadActual(): PrioridadCita {
    if (this._registros.length === 0) {
      throw new Error("El historial de prioridades está vacío");
    }
    return this._registros[this._registros.length - 1].prioridad;
  }

  obtenerOrigenActual(): OrigenPrioridad {
    if (this._registros.length === 0) {
      throw new Error("El historial de prioridades está vacío");
    }
    return this._registros[this._registros.length - 1].origen;
  }

  obtenerHistorialCompleto(): readonly PrioridadRegistro[] {
    return this._registros;
  }

  agregarPrioridad(registro: PrioridadRegistro): HistorialPrioridad {
    const nuevosRegistros = [...this._registros, registro];
    return new HistorialPrioridad(nuevosRegistros);
  }

  private validarOrdenCronologico(registros: PrioridadRegistro[]): void {
    const timestamps = registros.map((r) => r.ocurrioEn.getTime());
    const ordenados = [...timestamps].sort((a, b) => a - b);
    
    for (let i = 0; i < timestamps.length; i++) {
      if (timestamps[i] !== ordenados[i]) {
        throw new Error(
          "El historial de prioridades debe estar en orden cronológico"
        );
      }
    }
  }

  private validarTimestampsUnicos(registros: PrioridadRegistro[]): void {
    const timestamps = registros.map((r) => r.ocurrioEn.getTime());
    const unicos = new Set(timestamps);
    
    if (timestamps.length !== unicos.size) {
      throw new Error(
        "No pueden existir múltiples prioridades con el mismo timestamp"
      );
    }
  }

  private validarJustificacionHumana(registros: PrioridadRegistro[]): void {
    for (const registro of registros) {
      if (registro.origen === "Humano") {
        if (
          !registro.justificacion ||
          registro.justificacion.trim().length === 0
        ) {
          throw new Error(
            "La justificación es obligatoria cuando el origen es Humano"
          );
        }
        if (!registro.modificadoPor || registro.modificadoPor.trim().length === 0) {
          throw new Error(
            "El modificador es obligatorio cuando el origen es Humano"
          );
        }
      }
    }
  }
}

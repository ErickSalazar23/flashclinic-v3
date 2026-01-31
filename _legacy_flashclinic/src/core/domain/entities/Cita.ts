import { HistorialEstado, EstadoRegistro } from "../value-objects/HistorialEstado";
import {
  HistorialPrioridad,
  PrioridadRegistro,
} from "../value-objects/HistorialPrioridad";
import { EstadoCitaCambiado } from "../events/EstadoCitaCambiado";
import { PrioridadCitaSobrescritaPorHumano } from "../events/PrioridadCitaSobrescritaPorHumano";
import { CitaReprogramada } from "../events/CitaReprogramada";
import { CitaCancelada } from "../events/CitaCancelada";

export type EstadoCita =
  | "Solicitada"
  | "Confirmada"
  | "Reprogramada"
  | "Cancelada"
  | "Atendida"
  | "NoAsistió";

export type PrioridadCita = "Alta" | "Media" | "Baja";

export class Cita {
  private readonly _id: string;
  private readonly _pacienteId: string;
  private readonly _especialidad: string;
  private readonly _fechaHora: Date;
  private readonly _creadoEn: Date;
  private readonly _historialEstado: HistorialEstado;
  private readonly _historialPrioridad: HistorialPrioridad;

  constructor(params: {
    id: string;
    pacienteId: string;
    especialidad: string;
    fechaHora: Date;
    prioridadInicial: PrioridadCita;
    creadoEn: Date;
    historialEstado?: HistorialEstado;
    historialPrioridad?: HistorialPrioridad;
  }) {
    const {
      id,
      pacienteId,
      especialidad,
      fechaHora,
      prioridadInicial,
      creadoEn,
    } = params;

    Cita.validarId(id);
    Cita.validarPacienteId(pacienteId);
    Cita.validarEspecialidad(especialidad);
    Cita.validarFechaHora(fechaHora);
    Cita.validarPrioridad(prioridadInicial);
    Cita.validarFechaCreacion(creadoEn, fechaHora);

    this._id = id;
    this._pacienteId = pacienteId;
    this._especialidad = especialidad.trim();
    this._fechaHora = new Date(fechaHora);
    this._creadoEn = new Date(creadoEn);

    if (params.historialEstado) {
      this._historialEstado = params.historialEstado;
    } else {
      this._historialEstado = new HistorialEstado([
        {
          estado: "Solicitada",
          ocurrioEn: new Date(creadoEn),
        },
      ]);
    }

    if (params.historialPrioridad) {
      this._historialPrioridad = params.historialPrioridad;
    } else {
      this._historialPrioridad = new HistorialPrioridad([
        {
          prioridad: prioridadInicial,
          origen: "Sistema",
          ocurrioEn: new Date(creadoEn),
        },
      ]);
    }
  }

  get id(): string {
    return this._id;
  }

  get pacienteId(): string {
    return this._pacienteId;
  }

  get especialidad(): string {
    return this._especialidad;
  }

  get fechaHora(): Date {
    return new Date(this._fechaHora);
  }

  get creadoEn(): Date {
    return new Date(this._creadoEn);
  }

  get estado(): EstadoCita {
    return this._historialEstado.obtenerEstadoActual();
  }

  get prioridad(): PrioridadCita {
    return this._historialPrioridad.obtenerPrioridadActual();
  }

  get historialEstado(): readonly EstadoRegistro[] {
    return this._historialEstado.obtenerHistorialCompleto();
  }

  get historialPrioridad(): readonly PrioridadRegistro[] {
    return this._historialPrioridad.obtenerHistorialCompleto();
  }

  cambiarEstado(
    nuevoEstado: EstadoCita,
    ocurrioEn: Date
  ): { evento: EstadoCitaCambiado; nuevaCita: Cita } {
    const estadoActual = this.estado;

    if (estadoActual === nuevoEstado) {
      throw new Error(
        `No se puede cambiar al mismo estado: ${nuevoEstado}`
      );
    }

    Cita.validarTransicionEstado(estadoActual, nuevoEstado);

    const evento = new EstadoCitaCambiado({
      citaId: this._id,
      estadoAnterior: estadoActual,
      estadoNuevo: nuevoEstado,
      ocurrioEn: new Date(ocurrioEn),
    });

    const nuevoRegistro: EstadoRegistro = {
      estado: nuevoEstado,
      ocurrioEn: new Date(ocurrioEn),
      eventoId: evento.constructor.name,
    };

    const nuevoHistorialEstado = this._historialEstado.agregarEstado(
      nuevoRegistro
    );

    const nuevaCita = new Cita({
      id: this._id,
      pacienteId: this._pacienteId,
      especialidad: this._especialidad,
      fechaHora: this._fechaHora,
      prioridadInicial: this.prioridad,
      creadoEn: this._creadoEn,
      historialEstado: nuevoHistorialEstado,
      historialPrioridad: this._historialPrioridad,
    });

    return { evento, nuevaCita };
  }

  sobrescribirPrioridad(
    nuevaPrioridad: PrioridadCita,
    justificacion: string,
    modificadoPor: string,
    ocurrioEn: Date
  ): { evento: PrioridadCitaSobrescritaPorHumano; nuevaCita: Cita } {
    Cita.validarPrioridad(nuevaPrioridad);

    if (!justificacion || justificacion.trim().length === 0) {
      throw new Error("La justificación es obligatoria para sobrescribir prioridad");
    }

    if (!modificadoPor || modificadoPor.trim().length === 0) {
      throw new Error("El identificador del modificador es obligatorio");
    }

    const prioridadActual = this.prioridad;

    if (prioridadActual === nuevaPrioridad) {
      throw new Error(
        `No se puede cambiar a la misma prioridad: ${nuevaPrioridad}`
      );
    }

    const evento = new PrioridadCitaSobrescritaPorHumano({
      citaId: this._id,
      prioridadAnterior: prioridadActual,
      prioridadNueva: nuevaPrioridad,
      justificacion: justificacion.trim(),
      modificadoPor: modificadoPor.trim(),
      ocurrioEn: new Date(ocurrioEn),
    });

    const nuevoRegistro: PrioridadRegistro = {
      prioridad: nuevaPrioridad,
      origen: "Humano",
      ocurrioEn: new Date(ocurrioEn),
      justificacion: justificacion.trim(),
      modificadoPor: modificadoPor.trim(),
      eventoId: evento.constructor.name,
    };

    const nuevoHistorialPrioridad = this._historialPrioridad.agregarPrioridad(
      nuevoRegistro
    );

    const nuevaCita = new Cita({
      id: this._id,
      pacienteId: this._pacienteId,
      especialidad: this._especialidad,
      fechaHora: this._fechaHora,
      prioridadInicial: nuevaPrioridad,
      creadoEn: this._creadoEn,
      historialEstado: this._historialEstado,
      historialPrioridad: nuevoHistorialPrioridad,
    });

    return { evento, nuevaCita };
  }

  reprogramar(
    nuevaFechaHora: Date,
    ocurrioEn: Date
  ): {
    eventoReprogramada: CitaReprogramada;
    eventoEstadoCambiado?: EstadoCitaCambiado;
    nuevaCita: Cita;
  } {
    Cita.validarFechaHora(nuevaFechaHora);

    const fechaHoraActual = this._fechaHora.getTime();
    const nuevaFechaHoraTime = nuevaFechaHora.getTime();

    if (fechaHoraActual === nuevaFechaHoraTime) {
      throw new Error(
        "La nueva fecha y hora debe ser diferente a la fecha actual"
      );
    }

    const eventoReprogramada = new CitaReprogramada({
      citaId: this._id,
      fechaHoraAnterior: this._fechaHora,
      fechaHoraNueva: nuevaFechaHora,
      ocurrioEn: new Date(ocurrioEn),
    });

    let citaConNuevaFecha = new Cita({
      id: this._id,
      pacienteId: this._pacienteId,
      especialidad: this._especialidad,
      fechaHora: nuevaFechaHora,
      prioridadInicial: this.prioridad,
      creadoEn: this._creadoEn,
      historialEstado: this._historialEstado,
      historialPrioridad: this._historialPrioridad,
    });

    const estadoActual = this.estado;
    let eventoEstadoCambiado: EstadoCitaCambiado | undefined;

    if (estadoActual !== "Reprogramada") {
      const resultado = citaConNuevaFecha.cambiarEstado(
        "Reprogramada",
        ocurrioEn
      );
      eventoEstadoCambiado = resultado.evento;
      citaConNuevaFecha = resultado.nuevaCita;
    }

    return {
      eventoReprogramada,
      eventoEstadoCambiado,
      nuevaCita: citaConNuevaFecha,
    };
  }

  cancelar(ocurrioEn: Date): {
    eventoCancelada: CitaCancelada;
    eventoEstadoCambiado: EstadoCitaCambiado;
    nuevaCita: Cita;
  } {
    const estadoActual = this.estado;

    if (estadoActual === "Cancelada") {
      throw new Error("La cita ya está cancelada");
    }

    Cita.validarTransicionEstado(estadoActual, "Cancelada");

    const eventoCancelada = new CitaCancelada({
      citaId: this._id,
      pacienteId: this._pacienteId,
      ocurrioEn: new Date(ocurrioEn),
    });

    const { evento: eventoEstadoCambiado, nuevaCita } = this.cambiarEstado(
      "Cancelada",
      ocurrioEn
    );

    return {
      eventoCancelada,
      eventoEstadoCambiado,
      nuevaCita,
    };
  }

  aplicarEventoEstado(evento: EstadoCitaCambiado): Cita {
    const nuevoRegistro: EstadoRegistro = {
      estado: evento.estadoNuevo,
      ocurrioEn: new Date(evento.ocurrioEn),
      eventoId: evento.constructor.name,
    };

    const nuevoHistorialEstado = this._historialEstado.agregarEstado(
      nuevoRegistro
    );

    return new Cita({
      id: this._id,
      pacienteId: this._pacienteId,
      especialidad: this._especialidad,
      fechaHora: this._fechaHora,
      prioridadInicial: this.prioridad,
      creadoEn: this._creadoEn,
      historialEstado: nuevoHistorialEstado,
      historialPrioridad: this._historialPrioridad,
    });
  }

  aplicarEventoPrioridad(
    evento: PrioridadCitaSobrescritaPorHumano
  ): Cita {
    const nuevoRegistro: PrioridadRegistro = {
      prioridad: evento.prioridadNueva,
      origen: "Humano",
      ocurrioEn: new Date(evento.ocurrioEn),
      justificacion: evento.justificacion,
      modificadoPor: evento.modificadoPor,
      eventoId: evento.constructor.name,
    };

    const nuevoHistorialPrioridad = this._historialPrioridad.agregarPrioridad(
      nuevoRegistro
    );

    return new Cita({
      id: this._id,
      pacienteId: this._pacienteId,
      especialidad: this._especialidad,
      fechaHora: this._fechaHora,
      prioridadInicial: evento.prioridadNueva,
      creadoEn: this._creadoEn,
      historialEstado: this._historialEstado,
      historialPrioridad: nuevoHistorialPrioridad,
    });
  }

  private static validarId(id: string): void {
    if (!id || id.trim().length === 0) {
      throw new Error("El id de la cita es requerido");
    }
  }

  private static validarPacienteId(pacienteId: string): void {
    if (!pacienteId || pacienteId.trim().length === 0) {
      throw new Error("El pacienteId de la cita es requerido");
    }
  }

  private static validarEspecialidad(especialidad: string): void {
    if (!especialidad || especialidad.trim().length === 0) {
      throw new Error("La especialidad de la cita es requerida");
    }
  }

  private static validarFechaHora(fechaHora: Date): void {
    if (!(fechaHora instanceof Date) || isNaN(fechaHora.getTime())) {
      throw new Error("La fecha y hora de la cita debe ser una fecha válida");
    }

    const ahora = new Date();
    if (fechaHora.getTime() < ahora.getTime()) {
      throw new Error(
        "La fecha y hora de la cita no puede estar en el pasado"
      );
    }
  }

  private static validarFechaCreacion(
    creadoEn: Date,
    fechaHora: Date
  ): void {
    if (!(creadoEn instanceof Date) || isNaN(creadoEn.getTime())) {
      throw new Error("La fecha de creación debe ser una fecha válida");
    }

    if (creadoEn.getTime() > fechaHora.getTime()) {
      throw new Error(
        "La fecha de creación no puede ser posterior a la fecha de la cita"
      );
    }
  }

  private static validarPrioridad(prioridad: PrioridadCita): void {
    const permitidas: PrioridadCita[] = ["Alta", "Media", "Baja"];
    if (!permitidas.includes(prioridad)) {
      throw new Error("La prioridad de la cita no es válida");
    }
  }

  private static validarTransicionEstado(
    estadoActual: EstadoCita,
    nuevoEstado: EstadoCita
  ): void {
    const transicionesPermitidas: Record<EstadoCita, EstadoCita[]> = {
      Solicitada: ["Confirmada", "Cancelada"],
      Confirmada: ["Reprogramada", "Cancelada", "Atendida", "NoAsistió"],
      Reprogramada: ["Confirmada", "Cancelada"],
      Cancelada: [],
      Atendida: [],
      NoAsistió: [],
    };

    const estadosPermitidos = transicionesPermitidas[estadoActual];
    if (!estadosPermitidos.includes(nuevoEstado)) {
      throw new Error(
        `No se puede transicionar de ${estadoActual} a ${nuevoEstado}`
      );
    }
  }
}

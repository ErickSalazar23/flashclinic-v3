"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cita = void 0;
const HistorialEstado_1 = require("../value-objects/HistorialEstado");
const HistorialPrioridad_1 = require("../value-objects/HistorialPrioridad");
const EstadoCitaCambiado_1 = require("../events/EstadoCitaCambiado");
const PrioridadCitaSobrescritaPorHumano_1 = require("../events/PrioridadCitaSobrescritaPorHumano");
const CitaReprogramada_1 = require("../events/CitaReprogramada");
const CitaCancelada_1 = require("../events/CitaCancelada");
class Cita {
    constructor(params) {
        const { id, pacienteId, especialidad, fechaHora, prioridadInicial, creadoEn, } = params;
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
        }
        else {
            this._historialEstado = new HistorialEstado_1.HistorialEstado([
                {
                    estado: "Solicitada",
                    ocurrioEn: new Date(creadoEn),
                },
            ]);
        }
        if (params.historialPrioridad) {
            this._historialPrioridad = params.historialPrioridad;
        }
        else {
            this._historialPrioridad = new HistorialPrioridad_1.HistorialPrioridad([
                {
                    prioridad: prioridadInicial,
                    origen: "Sistema",
                    ocurrioEn: new Date(creadoEn),
                },
            ]);
        }
    }
    get id() {
        return this._id;
    }
    get pacienteId() {
        return this._pacienteId;
    }
    get especialidad() {
        return this._especialidad;
    }
    get fechaHora() {
        return new Date(this._fechaHora);
    }
    get creadoEn() {
        return new Date(this._creadoEn);
    }
    get estado() {
        return this._historialEstado.obtenerEstadoActual();
    }
    get prioridad() {
        return this._historialPrioridad.obtenerPrioridadActual();
    }
    get historialEstado() {
        return this._historialEstado.obtenerHistorialCompleto();
    }
    get historialPrioridad() {
        return this._historialPrioridad.obtenerHistorialCompleto();
    }
    cambiarEstado(nuevoEstado, ocurrioEn) {
        const estadoActual = this.estado;
        if (estadoActual === nuevoEstado) {
            throw new Error(`No se puede cambiar al mismo estado: ${nuevoEstado}`);
        }
        Cita.validarTransicionEstado(estadoActual, nuevoEstado);
        const evento = new EstadoCitaCambiado_1.EstadoCitaCambiado({
            citaId: this._id,
            estadoAnterior: estadoActual,
            estadoNuevo: nuevoEstado,
            ocurrioEn: new Date(ocurrioEn),
        });
        const nuevoRegistro = {
            estado: nuevoEstado,
            ocurrioEn: new Date(ocurrioEn),
            eventoId: evento.constructor.name,
        };
        const nuevoHistorialEstado = this._historialEstado.agregarEstado(nuevoRegistro);
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
    sobrescribirPrioridad(nuevaPrioridad, justificacion, modificadoPor, ocurrioEn) {
        Cita.validarPrioridad(nuevaPrioridad);
        if (!justificacion || justificacion.trim().length === 0) {
            throw new Error("La justificación es obligatoria para sobrescribir prioridad");
        }
        if (!modificadoPor || modificadoPor.trim().length === 0) {
            throw new Error("El identificador del modificador es obligatorio");
        }
        const prioridadActual = this.prioridad;
        if (prioridadActual === nuevaPrioridad) {
            throw new Error(`No se puede cambiar a la misma prioridad: ${nuevaPrioridad}`);
        }
        const evento = new PrioridadCitaSobrescritaPorHumano_1.PrioridadCitaSobrescritaPorHumano({
            citaId: this._id,
            prioridadAnterior: prioridadActual,
            prioridadNueva: nuevaPrioridad,
            justificacion: justificacion.trim(),
            modificadoPor: modificadoPor.trim(),
            ocurrioEn: new Date(ocurrioEn),
        });
        const nuevoRegistro = {
            prioridad: nuevaPrioridad,
            origen: "Humano",
            ocurrioEn: new Date(ocurrioEn),
            justificacion: justificacion.trim(),
            modificadoPor: modificadoPor.trim(),
            eventoId: evento.constructor.name,
        };
        const nuevoHistorialPrioridad = this._historialPrioridad.agregarPrioridad(nuevoRegistro);
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
    reprogramar(nuevaFechaHora, ocurrioEn) {
        Cita.validarFechaHora(nuevaFechaHora);
        const fechaHoraActual = this._fechaHora.getTime();
        const nuevaFechaHoraTime = nuevaFechaHora.getTime();
        if (fechaHoraActual === nuevaFechaHoraTime) {
            throw new Error("La nueva fecha y hora debe ser diferente a la fecha actual");
        }
        const eventoReprogramada = new CitaReprogramada_1.CitaReprogramada({
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
        let eventoEstadoCambiado;
        if (estadoActual !== "Reprogramada") {
            const resultado = citaConNuevaFecha.cambiarEstado("Reprogramada", ocurrioEn);
            eventoEstadoCambiado = resultado.evento;
            citaConNuevaFecha = resultado.nuevaCita;
        }
        return {
            eventoReprogramada,
            eventoEstadoCambiado,
            nuevaCita: citaConNuevaFecha,
        };
    }
    cancelar(ocurrioEn) {
        const estadoActual = this.estado;
        if (estadoActual === "Cancelada") {
            throw new Error("La cita ya está cancelada");
        }
        Cita.validarTransicionEstado(estadoActual, "Cancelada");
        const eventoCancelada = new CitaCancelada_1.CitaCancelada({
            citaId: this._id,
            pacienteId: this._pacienteId,
            ocurrioEn: new Date(ocurrioEn),
        });
        const { evento: eventoEstadoCambiado, nuevaCita } = this.cambiarEstado("Cancelada", ocurrioEn);
        return {
            eventoCancelada,
            eventoEstadoCambiado,
            nuevaCita,
        };
    }
    aplicarEventoEstado(evento) {
        const nuevoRegistro = {
            estado: evento.estadoNuevo,
            ocurrioEn: new Date(evento.ocurrioEn),
            eventoId: evento.constructor.name,
        };
        const nuevoHistorialEstado = this._historialEstado.agregarEstado(nuevoRegistro);
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
    aplicarEventoPrioridad(evento) {
        const nuevoRegistro = {
            prioridad: evento.prioridadNueva,
            origen: "Humano",
            ocurrioEn: new Date(evento.ocurrioEn),
            justificacion: evento.justificacion,
            modificadoPor: evento.modificadoPor,
            eventoId: evento.constructor.name,
        };
        const nuevoHistorialPrioridad = this._historialPrioridad.agregarPrioridad(nuevoRegistro);
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
    static validarId(id) {
        if (!id || id.trim().length === 0) {
            throw new Error("El id de la cita es requerido");
        }
    }
    static validarPacienteId(pacienteId) {
        if (!pacienteId || pacienteId.trim().length === 0) {
            throw new Error("El pacienteId de la cita es requerido");
        }
    }
    static validarEspecialidad(especialidad) {
        if (!especialidad || especialidad.trim().length === 0) {
            throw new Error("La especialidad de la cita es requerida");
        }
    }
    static validarFechaHora(fechaHora) {
        if (!(fechaHora instanceof Date) || isNaN(fechaHora.getTime())) {
            throw new Error("La fecha y hora de la cita debe ser una fecha válida");
        }
        const ahora = new Date();
        if (fechaHora.getTime() < ahora.getTime()) {
            throw new Error("La fecha y hora de la cita no puede estar en el pasado");
        }
    }
    static validarFechaCreacion(creadoEn, fechaHora) {
        if (!(creadoEn instanceof Date) || isNaN(creadoEn.getTime())) {
            throw new Error("La fecha de creación debe ser una fecha válida");
        }
        if (creadoEn.getTime() > fechaHora.getTime()) {
            throw new Error("La fecha de creación no puede ser posterior a la fecha de la cita");
        }
    }
    static validarPrioridad(prioridad) {
        const permitidas = ["Alta", "Media", "Baja"];
        if (!permitidas.includes(prioridad)) {
            throw new Error("La prioridad de la cita no es válida");
        }
    }
    static validarTransicionEstado(estadoActual, nuevoEstado) {
        const transicionesPermitidas = {
            Solicitada: ["Confirmada", "Cancelada"],
            Confirmada: ["Reprogramada", "Cancelada", "Atendida", "NoAsistió"],
            Reprogramada: ["Confirmada", "Cancelada"],
            Cancelada: [],
            Atendida: [],
            NoAsistió: [],
        };
        const estadosPermitidos = transicionesPermitidas[estadoActual];
        if (!estadosPermitidos.includes(nuevoEstado)) {
            throw new Error(`No se puede transicionar de ${estadoActual} a ${nuevoEstado}`);
        }
    }
}
exports.Cita = Cita;

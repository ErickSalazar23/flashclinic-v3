"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Paciente = void 0;
class Paciente {
    constructor(id, nombre, telefono, fechaNacimiento, esRecurrente = false) {
        this.validarId(id);
        this.validarNombre(nombre);
        this.validarTelefono(telefono);
        this.validarFechaNacimiento(fechaNacimiento);
        this._id = id;
        this._nombre = nombre.trim();
        this._telefono = telefono.trim();
        this._fechaNacimiento = fechaNacimiento;
        this._esRecurrente = esRecurrente;
    }
    get id() {
        return this._id;
    }
    get nombre() {
        return this._nombre;
    }
    get telefono() {
        return this._telefono;
    }
    get fechaNacimiento() {
        return new Date(this._fechaNacimiento);
    }
    get esRecurrente() {
        return this._esRecurrente;
    }
    validarId(id) {
        if (!id || id.trim().length === 0) {
            throw new Error('El ID del paciente es requerido');
        }
    }
    validarNombre(nombre) {
        if (!nombre || nombre.trim().length === 0) {
            throw new Error('El nombre del paciente es requerido');
        }
        if (nombre.trim().length < 2) {
            throw new Error('El nombre del paciente debe tener al menos 2 caracteres');
        }
    }
    validarTelefono(telefono) {
        if (!telefono || telefono.trim().length === 0) {
            throw new Error('El teléfono del paciente es requerido');
        }
        // Validación básica: debe contener solo números, espacios, guiones y paréntesis
        const telefonoLimpio = telefono.replace(/[\s\-\(\)]/g, '');
        if (telefonoLimpio.length < 8) {
            throw new Error('El teléfono del paciente debe tener al menos 8 dígitos');
        }
        if (!/^\d+$/.test(telefonoLimpio)) {
            throw new Error('El teléfono del paciente contiene caracteres inválidos');
        }
    }
    validarFechaNacimiento(fechaNacimiento) {
        if (!(fechaNacimiento instanceof Date) || isNaN(fechaNacimiento.getTime())) {
            throw new Error('La fecha de nacimiento debe ser una fecha válida');
        }
        const hoy = new Date();
        if (fechaNacimiento > hoy) {
            throw new Error('La fecha de nacimiento no puede ser futura');
        }
        // Validar que no sea demasiado antigua (más de 150 años)
        const edadMaxima = new Date();
        edadMaxima.setFullYear(edadMaxima.getFullYear() - 150);
        if (fechaNacimiento < edadMaxima) {
            throw new Error('La fecha de nacimiento no puede ser anterior a hace 150 años');
        }
    }
}
exports.Paciente = Paciente;

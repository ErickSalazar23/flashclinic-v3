export class Paciente {
  private readonly _id: string;
  private readonly _nombre: string;
  private readonly _telefono: string;
  private readonly _fechaNacimiento: Date;
  private readonly _esRecurrente: boolean;

  constructor(
    id: string,
    nombre: string,
    telefono: string,
    fechaNacimiento: Date,
    esRecurrente: boolean = false
  ) {
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

  get id(): string {
    return this._id;
  }

  get nombre(): string {
    return this._nombre;
  }

  get telefono(): string {
    return this._telefono;
  }

  get fechaNacimiento(): Date {
    return new Date(this._fechaNacimiento);
  }

  get esRecurrente(): boolean {
    return this._esRecurrente;
  }

  private validarId(id: string): void {
    if (!id || id.trim().length === 0) {
      throw new Error('El ID del paciente es requerido');
    }
  }

  private validarNombre(nombre: string): void {
    if (!nombre || nombre.trim().length === 0) {
      throw new Error('El nombre del paciente es requerido');
    }
    if (nombre.trim().length < 2) {
      throw new Error('El nombre del paciente debe tener al menos 2 caracteres');
    }
  }

  private validarTelefono(telefono: string): void {
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

  private validarFechaNacimiento(fechaNacimiento: Date): void {
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

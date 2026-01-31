export declare class Paciente {
    private readonly _id;
    private readonly _nombre;
    private readonly _telefono;
    private readonly _fechaNacimiento;
    private readonly _esRecurrente;
    constructor(id: string, nombre: string, telefono: string, fechaNacimiento: Date, esRecurrente?: boolean);
    get id(): string;
    get nombre(): string;
    get telefono(): string;
    get fechaNacimiento(): Date;
    get esRecurrente(): boolean;
    private validarId;
    private validarNombre;
    private validarTelefono;
    private validarFechaNacimiento;
}

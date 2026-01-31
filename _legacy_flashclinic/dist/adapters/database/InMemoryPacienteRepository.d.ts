import { Paciente } from "../../core/domain/entities/Paciente";
import { ObtenerPacientePort } from "../../core/ports/ObtenerPacientePort";
import { GuardarPacientePort } from "../../core/ports/GuardarPacientePort";
export declare class InMemoryPacienteRepository implements ObtenerPacientePort, GuardarPacientePort {
    private readonly pacientes;
    obtenerPorId(pacienteId: string): Promise<Paciente | null>;
    obtenerTodos(): Promise<Paciente[]>;
    guardar(paciente: Paciente): Promise<void>;
    limpiar(): void;
}

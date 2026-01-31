import { Cita } from "../../core/domain/entities/Cita";
import { ObtenerCitaPort } from "../../core/ports/ObtenerCitaPort";
import { GuardarCitaPort } from "../../core/ports/GuardarCitaPort";
import { ListarCitasPort, ListarCitasQuery } from "../../core/ports/ListarCitasPort";
export declare class InMemoryCitaRepository implements ObtenerCitaPort, GuardarCitaPort, ListarCitasPort {
    private readonly citas;
    obtenerPorId(citaId: string): Promise<Cita | null>;
    guardar(cita: Cita): Promise<void>;
    obtenerTodas(query?: ListarCitasQuery): Promise<Cita[]>;
    limpiar(): void;
}

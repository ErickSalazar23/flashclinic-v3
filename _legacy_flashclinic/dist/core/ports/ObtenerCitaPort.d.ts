import { Cita } from "../domain/entities/Cita";
export interface ObtenerCitaPort {
    obtenerPorId(citaId: string): Promise<Cita | null>;
}

import { Cita } from "../domain/entities/Cita";

export interface ListarCitasQuery {
  pacienteId?: string;
  estado?: string;
}

export interface ListarCitasPort {
  obtenerTodas(query?: ListarCitasQuery): Promise<Cita[]>;
}

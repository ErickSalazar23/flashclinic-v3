import { Cita } from "../domain/entities/Cita";

export interface GuardarCitaPort {
  guardar(cita: Cita): Promise<void>;
}

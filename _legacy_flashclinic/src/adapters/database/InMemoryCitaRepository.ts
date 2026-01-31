import { Cita } from "../../core/domain/entities/Cita";
import { ObtenerCitaPort } from "../../core/ports/ObtenerCitaPort";
import { GuardarCitaPort } from "../../core/ports/GuardarCitaPort";
import { ListarCitasPort, ListarCitasQuery } from "../../core/ports/ListarCitasPort";

export class InMemoryCitaRepository
  implements ObtenerCitaPort, GuardarCitaPort, ListarCitasPort
{
  private readonly citas: Map<string, Cita> = new Map();

  async obtenerPorId(citaId: string): Promise<Cita | null> {
    const cita = this.citas.get(citaId);
    return cita || null;
  }

  async guardar(cita: Cita): Promise<void> {
    this.citas.set(cita.id, cita);
  }

  async obtenerTodas(query?: ListarCitasQuery): Promise<Cita[]> {
    let citas = Array.from(this.citas.values());

    if (query?.pacienteId) {
      citas = citas.filter((c) => c.pacienteId === query.pacienteId);
    }
    if (query?.estado) {
      citas = citas.filter((c) => c.estado === query.estado);
    }

    return citas;
  }

  limpiar(): void {
    this.citas.clear();
  }
}

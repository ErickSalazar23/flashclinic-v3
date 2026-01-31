import { Cita } from "../domain/entities/Cita";
import { ListarCitasPort, ListarCitasQuery } from "../ports/ListarCitasPort";

export type Result<T> = { ok: true; value: T } | { ok: false; error: string };

export class ListarCitas {
  constructor(private readonly listarCitasPort: ListarCitasPort) {}

  async execute(query?: ListarCitasQuery): Promise<Result<Cita[]>> {
    try {
      const citas = await this.listarCitasPort.obtenerTodas(query);
      return { ok: true, value: citas };
    } catch (error: unknown) {
      const mensaje =
        error instanceof Error
          ? error.message
          : "Error desconocido al listar citas";
      return { ok: false, error: mensaje };
    }
  }
}

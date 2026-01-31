import { ListarCitas } from "../../../core/use-cases/ListarCitas";
import { ListarCitasQuery } from "../../../core/ports/ListarCitasPort";
import { HttpRequest, HttpResponse, ok, serverError } from "../types";
import { serializeCita } from "../serializers/CitaSerializer";

export class ListarCitasController {
  constructor(private readonly useCase: ListarCitas) {}

  async handle(request: HttpRequest): Promise<HttpResponse> {
    const query: ListarCitasQuery = {};

    if (request.query.pacienteId) {
      query.pacienteId = request.query.pacienteId;
    }
    if (request.query.estado) {
      query.estado = request.query.estado;
    }

    const resultado = await this.useCase.execute(query);

    if (resultado.ok) {
      return ok(resultado.value.map(serializeCita));
    }

    return serverError(resultado.error);
  }
}

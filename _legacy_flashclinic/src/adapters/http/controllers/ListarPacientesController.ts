import { ListarPacientes } from "../../../core/use-cases/ListarPacientes";
import { HttpRequest, HttpResponse, ok, serverError } from "../types";
import { serializePaciente } from "../serializers/PacienteSerializer";

export class ListarPacientesController {
  constructor(private readonly useCase: ListarPacientes) {}

  async handle(request: HttpRequest): Promise<HttpResponse> {
    const resultado = await this.useCase.execute();

    if (resultado.ok) {
      return ok(resultado.value.map(serializePaciente));
    }

    return serverError(resultado.error);
  }
}

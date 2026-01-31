import {
  RegistrarNoAsistencia,
  RegistrarNoAsistenciaCommand,
} from "../../../core/use-cases/RegistrarNoAsistencia";
import { HttpRequest, HttpResponse, ok, badRequest } from "../types";
import { serializeCita } from "../serializers/CitaSerializer";

export class RegistrarNoAsistenciaController {
  private readonly useCase: RegistrarNoAsistencia;

  constructor(useCase: RegistrarNoAsistencia) {
    this.useCase = useCase;
  }

  async handle(request: HttpRequest): Promise<HttpResponse> {
    const body = request.body as {
      citaId?: string;
    };

    const command: RegistrarNoAsistenciaCommand = {
      citaId: body.citaId ?? "",
    };

    const resultado = await this.useCase.execute(command);

    if (resultado.ok) {
      return ok(serializeCita(resultado.value));
    }

    return badRequest(resultado.error);
  }
}

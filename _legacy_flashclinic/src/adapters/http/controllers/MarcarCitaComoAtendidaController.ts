import {
  MarcarCitaComoAtendida,
  MarcarCitaComoAtendidaCommand,
} from "../../../core/use-cases/MarcarCitaComoAtendida";
import { HttpRequest, HttpResponse, ok, badRequest } from "../types";
import { serializeCita } from "../serializers/CitaSerializer";

export class MarcarCitaComoAtendidaController {
  private readonly useCase: MarcarCitaComoAtendida;

  constructor(useCase: MarcarCitaComoAtendida) {
    this.useCase = useCase;
  }

  async handle(request: HttpRequest): Promise<HttpResponse> {
    const body = request.body as {
      citaId?: string;
    };

    const command: MarcarCitaComoAtendidaCommand = {
      citaId: body.citaId ?? "",
    };

    const resultado = await this.useCase.execute(command);

    if (resultado.ok) {
      return ok(serializeCita(resultado.value));
    }

    return badRequest(resultado.error);
  }
}

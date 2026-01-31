import {
  ConfirmarCita,
  ConfirmarCitaCommand,
} from "../../../core/use-cases/ConfirmarCita";
import { HttpRequest, HttpResponse, ok, badRequest } from "../types";
import { serializeCita } from "../serializers/CitaSerializer";

export class ConfirmarCitaController {
  private readonly useCase: ConfirmarCita;

  constructor(useCase: ConfirmarCita) {
    this.useCase = useCase;
  }

  async handle(request: HttpRequest): Promise<HttpResponse> {
    const body = request.body as {
      citaId?: string;
    };

    const command: ConfirmarCitaCommand = {
      citaId: body.citaId ?? "",
    };

    const resultado = await this.useCase.execute(command);

    if (resultado.ok) {
      return ok(serializeCita(resultado.value));
    }

    return badRequest(resultado.error);
  }
}

import {
  ReprogramarCita,
  ReprogramarCitaCommand,
} from "../../../core/use-cases/ReprogramarCita";
import { HttpRequest, HttpResponse, ok, badRequest } from "../types";
import { serializeCita } from "../serializers/CitaSerializer";

export class ReprogramarCitaController {
  private readonly useCase: ReprogramarCita;

  constructor(useCase: ReprogramarCita) {
    this.useCase = useCase;
  }

  async handle(request: HttpRequest): Promise<HttpResponse> {
    const body = request.body as {
      citaId?: string;
      nuevaCitaId?: string;
      nuevaFechaHora?: string;
    };

    const command: ReprogramarCitaCommand = {
      citaId: body.citaId ?? "",
      nuevaCitaId: body.nuevaCitaId ?? "",
      nuevaFechaHora: new Date(body.nuevaFechaHora ?? ""),
    };

    const resultado = await this.useCase.execute(command);

    if (resultado.ok) {
      return ok({
        citaOriginal: serializeCita(resultado.value.citaOriginal),
        citaNueva: serializeCita(resultado.value.citaNueva),
      });
    }

    return badRequest(resultado.error);
  }
}

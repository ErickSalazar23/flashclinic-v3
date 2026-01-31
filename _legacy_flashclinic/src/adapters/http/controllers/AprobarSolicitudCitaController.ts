import {
  AprobarSolicitudCita,
  AprobarSolicitudCitaCommand,
} from "../../../core/use-cases/AprobarSolicitudCita";
import { HttpRequest, HttpResponse, ok, badRequest, conflict } from "../types";
import { serializeCita } from "../serializers/CitaSerializer";

export class AprobarSolicitudCitaController {
  private readonly useCase: AprobarSolicitudCita;

  constructor(useCase: AprobarSolicitudCita) {
    this.useCase = useCase;
  }

  async handle(request: HttpRequest): Promise<HttpResponse> {
    const body = request.body as {
      decisionId?: string;
    };

    if (!body.decisionId) {
      return badRequest("El campo decisionId es requerido");
    }

    const command: AprobarSolicitudCitaCommand = {
      decisionId: body.decisionId,
    };

    const resultado = await this.useCase.execute(command);

    if (resultado.ok) {
      return ok(serializeCita(resultado.value));
    }

    if ("estado" in resultado && resultado.estado === "ya_aprobada") {
      return conflict(resultado.error);
    }

    return badRequest(resultado.error);
  }
}

import {
  SolicitarCitaUseCase,
  SolicitarCitaCommand,
} from "../../../core/use-cases/SolicitarCitaUseCase";
import { HttpRequest, HttpResponse, ok, badRequest } from "../types";
import { serializeCita } from "../serializers/CitaSerializer";

export class SolicitarCitaController {
  private readonly useCase: SolicitarCitaUseCase;

  constructor(useCase: SolicitarCitaUseCase) {
    this.useCase = useCase;
  }

  async handle(request: HttpRequest): Promise<HttpResponse> {
    const body = request.body as {
      id?: string;
      pacienteId?: string;
      especialidad?: string;
      fechaHora?: string;
      motivo?: string;
      edad?: number;
      tiempoEsperaDias?: number;
    };

    const command: SolicitarCitaCommand = {
      id: body.id ?? "",
      pacienteId: body.pacienteId ?? "",
      especialidad: body.especialidad ?? "",
      fechaHora: new Date(body.fechaHora ?? ""),
      motivo: body.motivo ?? "",
      edad: body.edad ?? 0,
      tiempoEsperaDias: body.tiempoEsperaDias ?? 0,
    };

    const resultado = await this.useCase.execute(command);

    if (resultado.ok) {
      return ok(serializeCita(resultado.value));
    }

    if ("estado" in resultado) {
      return badRequest(
        `Decisión pendiente de aprobación: ${resultado.pendingDecisionId}`
      );
    }

    return badRequest(resultado.error);
  }
}

import {
  ActualizarEstadoCita,
  ActualizarEstadoCitaCommand,
} from "../../../core/use-cases/ActualizarEstadoCita";
import { EstadoCita } from "../../../core/domain/entities/Cita";
import { HttpRequest, HttpResponse, ok, badRequest, notFound } from "../types";
import { serializeCita } from "../serializers/CitaSerializer";

export class ActualizarEstadoCitaController {
  constructor(private readonly useCase: ActualizarEstadoCita) {}

  async handle(request: HttpRequest): Promise<HttpResponse> {
    const citaId = request.params.id;

    if (!citaId) {
      return badRequest("El id de la cita es requerido");
    }

    const body = request.body as {
      nuevoEstado?: string;
    };

    if (!body.nuevoEstado) {
      return badRequest("El campo nuevoEstado es requerido");
    }

    const estadosValidos: EstadoCita[] = [
      "Solicitada",
      "Confirmada",
      "Reprogramada",
      "Cancelada",
      "Atendida",
      "NoAsistió",
    ];

    if (!estadosValidos.includes(body.nuevoEstado as EstadoCita)) {
      return badRequest(
        `Estado no válido. Estados permitidos: ${estadosValidos.join(", ")}`
      );
    }

    const command: ActualizarEstadoCitaCommand = {
      citaId,
      nuevoEstado: body.nuevoEstado as EstadoCita,
    };

    const resultado = await this.useCase.execute(command);

    if (resultado.ok) {
      return ok(serializeCita(resultado.value));
    }

    if (resultado.error.includes("No se encontró")) {
      return notFound(resultado.error);
    }

    return badRequest(resultado.error);
  }
}

import {
  SobrescribirPrioridadCita,
  SobrescribirPrioridadCitaCommand,
} from "../../../core/use-cases/SobrescribirPrioridadCita";
import { PrioridadCita } from "../../../core/domain/entities/Cita";
import { HttpRequest, HttpResponse, ok, badRequest } from "../types";
import { serializeCita } from "../serializers/CitaSerializer";

export class SobrescribirPrioridadCitaController {
  private readonly useCase: SobrescribirPrioridadCita;

  constructor(useCase: SobrescribirPrioridadCita) {
    this.useCase = useCase;
  }

  async handle(request: HttpRequest): Promise<HttpResponse> {
    const body = request.body as {
      citaId?: string;
      nuevaPrioridad?: string;
      justificacion?: string;
      modificadoPor?: string;
    };

    const command: SobrescribirPrioridadCitaCommand = {
      citaId: body.citaId ?? "",
      nuevaPrioridad: (body.nuevaPrioridad ?? "Media") as PrioridadCita,
      justificacion: body.justificacion ?? "",
      modificadoPor: body.modificadoPor ?? "",
    };

    const resultado = await this.useCase.execute(command);

    if (resultado.ok) {
      return ok(serializeCita(resultado.value));
    }

    return badRequest(resultado.error);
  }
}

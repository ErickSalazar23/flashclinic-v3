import {
  CrearPaciente,
  CrearPacienteCommand,
} from "../../../core/use-cases/CrearPaciente";
import { HttpRequest, HttpResponse, ok, badRequest } from "../types";
import { serializePaciente } from "../serializers/PacienteSerializer";

export class CrearPacienteController {
  constructor(private readonly useCase: CrearPaciente) {}

  async handle(request: HttpRequest): Promise<HttpResponse> {
    const body = request.body as {
      id?: string;
      nombre?: string;
      telefono?: string;
      fechaNacimiento?: string;
      esRecurrente?: boolean;
    };

    if (!body.id || !body.nombre || !body.telefono || !body.fechaNacimiento) {
      return badRequest(
        "Campos requeridos: id, nombre, telefono, fechaNacimiento"
      );
    }

    const command: CrearPacienteCommand = {
      id: body.id,
      nombre: body.nombre,
      telefono: body.telefono,
      fechaNacimiento: new Date(body.fechaNacimiento),
      esRecurrente: body.esRecurrente,
    };

    const resultado = await this.useCase.execute(command);

    if (resultado.ok) {
      return ok(serializePaciente(resultado.value));
    }

    return badRequest(resultado.error);
  }
}

import { CrearPaciente } from "../../../core/use-cases/CrearPaciente";
import { HttpRequest, HttpResponse } from "../types";
export declare class CrearPacienteController {
    private readonly useCase;
    constructor(useCase: CrearPaciente);
    handle(request: HttpRequest): Promise<HttpResponse>;
}

import { ListarPacientes } from "../../../core/use-cases/ListarPacientes";
import { HttpRequest, HttpResponse } from "../types";
export declare class ListarPacientesController {
    private readonly useCase;
    constructor(useCase: ListarPacientes);
    handle(request: HttpRequest): Promise<HttpResponse>;
}

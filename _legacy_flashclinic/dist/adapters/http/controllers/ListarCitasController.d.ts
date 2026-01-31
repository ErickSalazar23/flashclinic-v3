import { ListarCitas } from "../../../core/use-cases/ListarCitas";
import { HttpRequest, HttpResponse } from "../types";
export declare class ListarCitasController {
    private readonly useCase;
    constructor(useCase: ListarCitas);
    handle(request: HttpRequest): Promise<HttpResponse>;
}

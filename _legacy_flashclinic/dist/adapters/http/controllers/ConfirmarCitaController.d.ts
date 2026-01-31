import { ConfirmarCita } from "../../../core/use-cases/ConfirmarCita";
import { HttpRequest, HttpResponse } from "../types";
export declare class ConfirmarCitaController {
    private readonly useCase;
    constructor(useCase: ConfirmarCita);
    handle(request: HttpRequest): Promise<HttpResponse>;
}

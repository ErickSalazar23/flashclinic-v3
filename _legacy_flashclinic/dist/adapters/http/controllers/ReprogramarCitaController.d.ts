import { ReprogramarCita } from "../../../core/use-cases/ReprogramarCita";
import { HttpRequest, HttpResponse } from "../types";
export declare class ReprogramarCitaController {
    private readonly useCase;
    constructor(useCase: ReprogramarCita);
    handle(request: HttpRequest): Promise<HttpResponse>;
}

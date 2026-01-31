import { MarcarCitaComoAtendida } from "../../../core/use-cases/MarcarCitaComoAtendida";
import { HttpRequest, HttpResponse } from "../types";
export declare class MarcarCitaComoAtendidaController {
    private readonly useCase;
    constructor(useCase: MarcarCitaComoAtendida);
    handle(request: HttpRequest): Promise<HttpResponse>;
}

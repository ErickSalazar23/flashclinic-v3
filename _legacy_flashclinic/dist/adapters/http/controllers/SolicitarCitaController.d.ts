import { SolicitarCitaUseCase } from "../../../core/use-cases/SolicitarCitaUseCase";
import { HttpRequest, HttpResponse } from "../types";
export declare class SolicitarCitaController {
    private readonly useCase;
    constructor(useCase: SolicitarCitaUseCase);
    handle(request: HttpRequest): Promise<HttpResponse>;
}

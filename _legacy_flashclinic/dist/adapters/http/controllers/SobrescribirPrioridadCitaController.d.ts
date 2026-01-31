import { SobrescribirPrioridadCita } from "../../../core/use-cases/SobrescribirPrioridadCita";
import { HttpRequest, HttpResponse } from "../types";
export declare class SobrescribirPrioridadCitaController {
    private readonly useCase;
    constructor(useCase: SobrescribirPrioridadCita);
    handle(request: HttpRequest): Promise<HttpResponse>;
}

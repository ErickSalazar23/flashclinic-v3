import { AprobarSolicitudCita } from "../../../core/use-cases/AprobarSolicitudCita";
import { HttpRequest, HttpResponse } from "../types";
export declare class AprobarSolicitudCitaController {
    private readonly useCase;
    constructor(useCase: AprobarSolicitudCita);
    handle(request: HttpRequest): Promise<HttpResponse>;
}

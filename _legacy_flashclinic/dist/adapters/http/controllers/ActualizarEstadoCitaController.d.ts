import { ActualizarEstadoCita } from "../../../core/use-cases/ActualizarEstadoCita";
import { HttpRequest, HttpResponse } from "../types";
export declare class ActualizarEstadoCitaController {
    private readonly useCase;
    constructor(useCase: ActualizarEstadoCita);
    handle(request: HttpRequest): Promise<HttpResponse>;
}

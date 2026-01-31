import { RegistrarNoAsistencia } from "../../../core/use-cases/RegistrarNoAsistencia";
import { HttpRequest, HttpResponse } from "../types";
export declare class RegistrarNoAsistenciaController {
    private readonly useCase;
    constructor(useCase: RegistrarNoAsistencia);
    handle(request: HttpRequest): Promise<HttpResponse>;
}

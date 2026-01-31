import { Cita } from "../domain/entities/Cita";
import { ListarCitasPort, ListarCitasQuery } from "../ports/ListarCitasPort";
export type Result<T> = {
    ok: true;
    value: T;
} | {
    ok: false;
    error: string;
};
export declare class ListarCitas {
    private readonly listarCitasPort;
    constructor(listarCitasPort: ListarCitasPort);
    execute(query?: ListarCitasQuery): Promise<Result<Cita[]>>;
}

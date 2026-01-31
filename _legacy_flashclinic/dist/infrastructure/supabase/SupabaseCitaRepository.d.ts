import { SupabaseClient } from "@supabase/supabase-js";
import { Cita } from "../../core/domain/entities/Cita";
import { ObtenerCitaPort } from "../../core/ports/ObtenerCitaPort";
import { GuardarCitaPort } from "../../core/ports/GuardarCitaPort";
import { ListarCitasPort, ListarCitasQuery } from "../../core/ports/ListarCitasPort";
export declare class SupabaseCitaRepository implements ObtenerCitaPort, GuardarCitaPort, ListarCitasPort {
    private readonly supabase;
    constructor(supabase: SupabaseClient);
    obtenerPorId(citaId: string): Promise<Cita | null>;
    guardar(cita: Cita): Promise<void>;
    obtenerTodas(query?: ListarCitasQuery): Promise<Cita[]>;
    private mapToDomain;
}

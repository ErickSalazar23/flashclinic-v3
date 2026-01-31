import { SupabaseClient } from "@supabase/supabase-js";
import { DomainEvent, PublicarEventoPort } from "../../core/ports/PublicarEventoPort";
type EventType = "CitaSolicitada" | "EstadoCitaCambiado" | "CitaReprogramada" | "CitaCancelada" | "PrioridadCitaAsignadaPorSistema" | "PrioridadCitaSobrescritaPorHumano";
interface EventRow {
    id: string;
    event_type: EventType;
    aggregate_id: string;
    payload: Record<string, unknown>;
    ocurrio_en: string;
    created_at: string;
}
export declare class SupabaseEventPublisher implements PublicarEventoPort {
    private readonly supabase;
    constructor(supabase: SupabaseClient);
    publicar(evento: DomainEvent): Promise<void>;
    obtenerEventosPorAggregate(aggregateId: string): Promise<EventRow[]>;
    obtenerTodosLosEventos(): Promise<EventRow[]>;
    private getEventType;
    private getAggregateId;
    private serializePayload;
}
export {};

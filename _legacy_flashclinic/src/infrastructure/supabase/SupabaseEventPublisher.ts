import { SupabaseClient } from "@supabase/supabase-js";
import {
  DomainEvent,
  PublicarEventoPort,
} from "../../core/ports/PublicarEventoPort";
import { CitaSolicitada } from "../../core/domain/events/CitaSolicitada";
import { EstadoCitaCambiado } from "../../core/domain/events/EstadoCitaCambiado";
import { CitaReprogramada } from "../../core/domain/events/CitaReprogramada";
import { CitaCancelada } from "../../core/domain/events/CitaCancelada";
import { PrioridadCitaAsignadaPorSistema } from "../../core/domain/events/PrioridadCitaAsignadaPorSistema";
import { PrioridadCitaSobrescritaPorHumano } from "../../core/domain/events/PrioridadCitaSobrescritaPorHumano";

type EventType =
  | "CitaSolicitada"
  | "EstadoCitaCambiado"
  | "CitaReprogramada"
  | "CitaCancelada"
  | "PrioridadCitaAsignadaPorSistema"
  | "PrioridadCitaSobrescritaPorHumano";

interface EventRow {
  id: string;
  event_type: EventType;
  aggregate_id: string;
  payload: Record<string, unknown>;
  ocurrio_en: string;
  created_at: string;
}

export class SupabaseEventPublisher implements PublicarEventoPort {
  constructor(private readonly supabase: SupabaseClient) {}

  async publicar(evento: DomainEvent): Promise<void> {
    const eventType = this.getEventType(evento);
    const aggregateId = this.getAggregateId(evento);
    const payload = this.serializePayload(evento);

    const { error } = await this.supabase.from("domain_events").insert({
      id: crypto.randomUUID(),
      event_type: eventType,
      aggregate_id: aggregateId,
      payload: payload,
      ocurrio_en: evento.ocurrioEn.toISOString(),
      created_at: new Date().toISOString(),
    });

    if (error) {
      throw new Error(`Error publishing event: ${error.message}`);
    }
  }

  async obtenerEventosPorAggregate(aggregateId: string): Promise<EventRow[]> {
    const { data, error } = await this.supabase
      .from("domain_events")
      .select("*")
      .eq("aggregate_id", aggregateId)
      .order("ocurrio_en", { ascending: true });

    if (error) {
      throw new Error(`Error fetching events: ${error.message}`);
    }

    return (data || []) as EventRow[];
  }

  async obtenerTodosLosEventos(): Promise<EventRow[]> {
    const { data, error } = await this.supabase
      .from("domain_events")
      .select("*")
      .order("ocurrio_en", { ascending: true });

    if (error) {
      throw new Error(`Error fetching all events: ${error.message}`);
    }

    return (data || []) as EventRow[];
  }

  private getEventType(evento: DomainEvent): EventType {
    if (evento instanceof CitaSolicitada) return "CitaSolicitada";
    if (evento instanceof EstadoCitaCambiado) return "EstadoCitaCambiado";
    if (evento instanceof CitaReprogramada) return "CitaReprogramada";
    if (evento instanceof CitaCancelada) return "CitaCancelada";
    if (evento instanceof PrioridadCitaAsignadaPorSistema)
      return "PrioridadCitaAsignadaPorSistema";
    if (evento instanceof PrioridadCitaSobrescritaPorHumano)
      return "PrioridadCitaSobrescritaPorHumano";

    throw new Error(`Unknown event type: ${evento.constructor.name}`);
  }

  private getAggregateId(evento: DomainEvent): string {
    if (evento instanceof CitaSolicitada) return evento.citaId;
    if (evento instanceof EstadoCitaCambiado) return evento.citaId;
    if (evento instanceof CitaReprogramada) return evento.citaId;
    if (evento instanceof CitaCancelada) return evento.citaId;
    if (evento instanceof PrioridadCitaAsignadaPorSistema) return evento.citaId;
    if (evento instanceof PrioridadCitaSobrescritaPorHumano)
      return evento.citaId;

    throw new Error(`Cannot extract aggregate ID from: ${evento.constructor.name}`);
  }

  private serializePayload(evento: DomainEvent): Record<string, unknown> {
    if (evento instanceof CitaSolicitada) {
      return {
        citaId: evento.citaId,
        pacienteId: evento.pacienteId,
        especialidad: evento.especialidad,
        fechaHora: evento.fechaHora.toISOString(),
        prioridad: evento.prioridad,
      };
    }

    if (evento instanceof EstadoCitaCambiado) {
      return {
        citaId: evento.citaId,
        estadoAnterior: evento.estadoAnterior,
        estadoNuevo: evento.estadoNuevo,
      };
    }

    if (evento instanceof CitaReprogramada) {
      return {
        citaId: evento.citaId,
        fechaHoraAnterior: evento.fechaHoraAnterior.toISOString(),
        fechaHoraNueva: evento.fechaHoraNueva.toISOString(),
      };
    }

    if (evento instanceof CitaCancelada) {
      return {
        citaId: evento.citaId,
        pacienteId: evento.pacienteId,
      };
    }

    if (evento instanceof PrioridadCitaAsignadaPorSistema) {
      return {
        citaId: evento.citaId,
        prioridad: evento.prioridad,
      };
    }

    if (evento instanceof PrioridadCitaSobrescritaPorHumano) {
      return {
        citaId: evento.citaId,
        prioridadAnterior: evento.prioridadAnterior,
        prioridadNueva: evento.prioridadNueva,
        justificacion: evento.justificacion,
        modificadoPor: evento.modificadoPor,
      };
    }

    throw new Error(`Cannot serialize event: ${evento.constructor.name}`);
  }
}

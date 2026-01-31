"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupabaseEventPublisher = void 0;
const CitaSolicitada_1 = require("../../core/domain/events/CitaSolicitada");
const EstadoCitaCambiado_1 = require("../../core/domain/events/EstadoCitaCambiado");
const CitaReprogramada_1 = require("../../core/domain/events/CitaReprogramada");
const CitaCancelada_1 = require("../../core/domain/events/CitaCancelada");
const PrioridadCitaAsignadaPorSistema_1 = require("../../core/domain/events/PrioridadCitaAsignadaPorSistema");
const PrioridadCitaSobrescritaPorHumano_1 = require("../../core/domain/events/PrioridadCitaSobrescritaPorHumano");
class SupabaseEventPublisher {
    constructor(supabase) {
        this.supabase = supabase;
    }
    async publicar(evento) {
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
    async obtenerEventosPorAggregate(aggregateId) {
        const { data, error } = await this.supabase
            .from("domain_events")
            .select("*")
            .eq("aggregate_id", aggregateId)
            .order("ocurrio_en", { ascending: true });
        if (error) {
            throw new Error(`Error fetching events: ${error.message}`);
        }
        return (data || []);
    }
    async obtenerTodosLosEventos() {
        const { data, error } = await this.supabase
            .from("domain_events")
            .select("*")
            .order("ocurrio_en", { ascending: true });
        if (error) {
            throw new Error(`Error fetching all events: ${error.message}`);
        }
        return (data || []);
    }
    getEventType(evento) {
        if (evento instanceof CitaSolicitada_1.CitaSolicitada)
            return "CitaSolicitada";
        if (evento instanceof EstadoCitaCambiado_1.EstadoCitaCambiado)
            return "EstadoCitaCambiado";
        if (evento instanceof CitaReprogramada_1.CitaReprogramada)
            return "CitaReprogramada";
        if (evento instanceof CitaCancelada_1.CitaCancelada)
            return "CitaCancelada";
        if (evento instanceof PrioridadCitaAsignadaPorSistema_1.PrioridadCitaAsignadaPorSistema)
            return "PrioridadCitaAsignadaPorSistema";
        if (evento instanceof PrioridadCitaSobrescritaPorHumano_1.PrioridadCitaSobrescritaPorHumano)
            return "PrioridadCitaSobrescritaPorHumano";
        throw new Error(`Unknown event type: ${evento.constructor.name}`);
    }
    getAggregateId(evento) {
        if (evento instanceof CitaSolicitada_1.CitaSolicitada)
            return evento.citaId;
        if (evento instanceof EstadoCitaCambiado_1.EstadoCitaCambiado)
            return evento.citaId;
        if (evento instanceof CitaReprogramada_1.CitaReprogramada)
            return evento.citaId;
        if (evento instanceof CitaCancelada_1.CitaCancelada)
            return evento.citaId;
        if (evento instanceof PrioridadCitaAsignadaPorSistema_1.PrioridadCitaAsignadaPorSistema)
            return evento.citaId;
        if (evento instanceof PrioridadCitaSobrescritaPorHumano_1.PrioridadCitaSobrescritaPorHumano)
            return evento.citaId;
        throw new Error(`Cannot extract aggregate ID from: ${evento.constructor.name}`);
    }
    serializePayload(evento) {
        if (evento instanceof CitaSolicitada_1.CitaSolicitada) {
            return {
                citaId: evento.citaId,
                pacienteId: evento.pacienteId,
                especialidad: evento.especialidad,
                fechaHora: evento.fechaHora.toISOString(),
                prioridad: evento.prioridad,
            };
        }
        if (evento instanceof EstadoCitaCambiado_1.EstadoCitaCambiado) {
            return {
                citaId: evento.citaId,
                estadoAnterior: evento.estadoAnterior,
                estadoNuevo: evento.estadoNuevo,
            };
        }
        if (evento instanceof CitaReprogramada_1.CitaReprogramada) {
            return {
                citaId: evento.citaId,
                fechaHoraAnterior: evento.fechaHoraAnterior.toISOString(),
                fechaHoraNueva: evento.fechaHoraNueva.toISOString(),
            };
        }
        if (evento instanceof CitaCancelada_1.CitaCancelada) {
            return {
                citaId: evento.citaId,
                pacienteId: evento.pacienteId,
            };
        }
        if (evento instanceof PrioridadCitaAsignadaPorSistema_1.PrioridadCitaAsignadaPorSistema) {
            return {
                citaId: evento.citaId,
                prioridad: evento.prioridad,
            };
        }
        if (evento instanceof PrioridadCitaSobrescritaPorHumano_1.PrioridadCitaSobrescritaPorHumano) {
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
exports.SupabaseEventPublisher = SupabaseEventPublisher;

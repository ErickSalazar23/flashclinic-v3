export interface DomainEvent {
    readonly ocurrioEn: Date;
}
export interface PublicarEventoPort {
    publicar(evento: DomainEvent): Promise<void>;
}

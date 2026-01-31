import { DomainEvent, PublicarEventoPort } from "../../core/ports/PublicarEventoPort";
export declare class WhatsAppEventPublisher implements PublicarEventoPort {
    publicar(evento: DomainEvent): Promise<void>;
    private construirMensaje;
    private simularEnvioWhatsApp;
}

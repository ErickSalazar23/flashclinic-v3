import { DomainEventHandler } from "../DomainEventHandler";
import { EstadoCitaCambiado } from "../../../core/domain/events/EstadoCitaCambiado";
export declare class OnEstadoCitaCambiado implements DomainEventHandler<EstadoCitaCambiado> {
    readonly eventType = "EstadoCitaCambiado";
    handle(event: EstadoCitaCambiado): Promise<void>;
    private getSeverity;
}

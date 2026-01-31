import { DomainEventHandler } from "../DomainEventHandler";
import { CitaSolicitada } from "../../../core/domain/events/CitaSolicitada";
export declare class OnCitaSolicitada implements DomainEventHandler<CitaSolicitada> {
    readonly eventType = "CitaSolicitada";
    handle(event: CitaSolicitada): Promise<void>;
}

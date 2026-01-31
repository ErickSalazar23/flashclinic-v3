import { DomainEventHandler } from "../DomainEventHandler";
import { CitaCancelada } from "../../../core/domain/events/CitaCancelada";
export declare class OnCitaCancelada implements DomainEventHandler<CitaCancelada> {
    readonly eventType = "CitaCancelada";
    handle(event: CitaCancelada): Promise<void>;
}

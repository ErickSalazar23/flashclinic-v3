import { DecisionOption } from "./DecisionOption";
import { AutonomyLevel } from "./AutonomyLevel";

export interface DecisionResult {
  readonly opciones: readonly DecisionOption[];
  readonly tradeoffs: readonly Tradeoff[];
  readonly recomendacionPrincipal: DecisionOption | null;
  readonly requiereIntervencionHumana: boolean;
  readonly razonIntervencion?: string;
  readonly autonomyLevel: AutonomyLevel;
}

export interface Tradeoff {
  readonly opcionId: string;
  readonly ventajas: readonly string[];
  readonly desventajas: readonly string[];
}

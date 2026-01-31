import { DecisionContext } from "./DecisionContext";
import { DecisionResult } from "./DecisionResult";
import { DecisionWeight } from "./DecisionWeight";
import { PrioridadDecision } from "./decisions/PrioridadDecision";

export class DecisionEngine {
  private readonly prioridadDecision: PrioridadDecision;

  constructor() {
    this.prioridadDecision = new PrioridadDecision();
  }

  evaluar(contexto: DecisionContext): DecisionResult {
    const peso = contexto.peso || "MEDIUM";

    switch (contexto.tipo) {
      case "prioridad_cita":
        return this.prioridadDecision.evaluar(contexto, peso);
      default:
        return {
          opciones: [],
          tradeoffs: [],
          recomendacionPrincipal: null,
          requiereIntervencionHumana: true,
          razonIntervencion: `Tipo de decisión desconocido: ${contexto.tipo}`,
          autonomyLevel: "BLOCKED",
        };
    }
  }
}

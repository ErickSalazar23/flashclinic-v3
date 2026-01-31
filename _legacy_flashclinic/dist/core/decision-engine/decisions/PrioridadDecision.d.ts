import { DecisionContext } from "../DecisionContext";
import { DecisionResult } from "../DecisionResult";
import { DecisionWeight } from "../DecisionWeight";
export declare class PrioridadDecision {
    evaluar(contexto: DecisionContext, peso: DecisionWeight): DecisionResult;
    private evaluarLow;
    private evaluarMedium;
    private evaluarHigh;
    private calcularAutonomyLevel;
    private evaluarAmbiguedadExtrema;
    private calcularConfianza;
    private obtenerRazones;
    private obtenerVentajas;
    private obtenerDesventajas;
    private evaluarAmbiguidad;
}

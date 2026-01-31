import { DecisionEngine } from "./DecisionEngine";
import { DecisionContext } from "./DecisionContext";

describe("DecisionEngine - Ley 3: Gestión del Criterio", () => {
  let engine: DecisionEngine;

  beforeEach(() => {
    engine = new DecisionEngine();
  });

  describe("Decisiones LOW", () => {
    it("no debe generar tradeoffs complejos", () => {
      const contexto: DecisionContext = {
        tipo: "prioridad_cita",
        peso: "LOW",
        datos: {
          motivo: "control rutinario",
          edad: 30,
          tiempoEsperaDias: 5,
        },
      };

      const resultado = engine.evaluar(contexto);

      expect(resultado).toBeDefined();
      expect(resultado.opciones.length).toBe(1);
      expect(resultado.tradeoffs.length).toBe(0);
      expect(resultado.recomendacionPrincipal).toBeDefined();
      expect(resultado.requiereIntervencionHumana).toBe(false);
    });

    it("debe seguir un camino simple y directo", () => {
      const contexto: DecisionContext = {
        tipo: "prioridad_cita",
        peso: "LOW",
        datos: {
          motivo: "revisión anual",
          edad: 25,
          tiempoEsperaDias: 10,
        },
      };

      const resultado = engine.evaluar(contexto);

      expect(resultado.opciones.length).toBe(1);
      expect(resultado.recomendacionPrincipal?.confianza).toBeGreaterThanOrEqual(0.9);
      expect(resultado.recomendacionPrincipal?.razones.length).toBeGreaterThan(0);
    });
  });

  describe("Decisiones HIGH", () => {
    it("debe generar más de una opción obligatoriamente", () => {
      const contexto: DecisionContext = {
        tipo: "prioridad_cita",
        peso: "HIGH",
        datos: {
          motivo: "dolor moderado en el pecho",
          edad: 45,
          tiempoEsperaDias: 10,
        },
      };

      const resultado = engine.evaluar(contexto);

      expect(resultado).toBeDefined();
      expect(resultado.opciones.length).toBeGreaterThan(1);
      expect(resultado.opciones.length).toBe(3);
      expect(resultado.tradeoffs.length).toBeGreaterThan(0);
    });

    it("debe activar requiereIntervencionHumana si la confianza es baja", () => {
      const contexto: DecisionContext = {
        tipo: "prioridad_cita",
        peso: "HIGH",
        datos: {
          motivo: "síntomas ambiguos",
          edad: 50,
          tiempoEsperaDias: 8,
        },
      };

      const resultado = engine.evaluar(contexto);

      expect(resultado.opciones.length).toBe(3);
      expect(resultado.tradeoffs.length).toBe(3);

      if (resultado.recomendacionPrincipal) {
        const confianza = resultado.recomendacionPrincipal.confianza;
        if (confianza < 0.7) {
          expect(resultado.requiereIntervencionHumana).toBe(true);
          expect(resultado.razonIntervencion).toBeDefined();
        }
      }
    });

    it("debe generar tradeoffs complejos con ventajas y desventajas", () => {
      const contexto: DecisionContext = {
        tipo: "prioridad_cita",
        peso: "HIGH",
        datos: {
          motivo: "dolor fuerte en el pecho",
          edad: 70,
          tiempoEsperaDias: 20,
        },
      };

      const resultado = engine.evaluar(contexto);

      expect(resultado.tradeoffs.length).toBe(3);

      resultado.tradeoffs.forEach((tradeoff) => {
        expect(tradeoff.ventajas.length).toBeGreaterThan(0);
        expect(tradeoff.desventajas.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Decisiones MEDIUM (comportamiento por defecto)", () => {
    it("debe mantener el comportamiento existente cuando no se especifica peso", () => {
      const contexto: DecisionContext = {
        tipo: "prioridad_cita",
        datos: {
          motivo: "dolor moderado",
          edad: 50,
          tiempoEsperaDias: 12,
        },
      };

      const resultado = engine.evaluar(contexto);

      expect(resultado.opciones.length).toBe(3);
      expect(resultado.tradeoffs.length).toBe(3);
    });
  });
});

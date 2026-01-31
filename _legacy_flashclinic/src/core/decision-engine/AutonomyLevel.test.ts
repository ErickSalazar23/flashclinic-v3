import { DecisionEngine } from "./DecisionEngine";
import { DecisionContext } from "./DecisionContext";

describe("DecisionEngine - Umbral de Autonomía", () => {
  let engine: DecisionEngine;

  beforeEach(() => {
    engine = new DecisionEngine();
  });

  describe("Decisiones LOW", () => {
    it("debe permitir ejecución automática", () => {
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

      expect(resultado.autonomyLevel).toBe("AUTOMATIC");
      expect(resultado.recomendacionPrincipal).toBeDefined();
      expect(resultado.requiereIntervencionHumana).toBe(false);
    });

    it("LOW siempre debe ser AUTOMATIC independientemente del motivo", () => {
      const contexto: DecisionContext = {
        tipo: "prioridad_cita",
        peso: "LOW",
        datos: {
          motivo: "cualquier motivo",
          edad: 25,
          tiempoEsperaDias: 10,
        },
      };

      const resultado = engine.evaluar(contexto);

      expect(resultado.autonomyLevel).toBe("AUTOMATIC");
    });
  });

  describe("Decisiones HIGH con ambigüedad", () => {
    it("debe ser SUPERVISED cuando hay ambigüedad (paciente mayor sin urgencia)", () => {
      const contexto: DecisionContext = {
        tipo: "prioridad_cita",
        peso: "HIGH",
        datos: {
          motivo: "control general",
          edad: 70,
          tiempoEsperaDias: 10,
        },
      };

      const resultado = engine.evaluar(contexto);

      expect(resultado.autonomyLevel).toBe("SUPERVISED");
      expect(resultado.requiereIntervencionHumana).toBe(true);
      expect(resultado.opciones.length).toBe(3);
    });

    it("debe ser BLOCKED con indicadores contradictorios (urgencia + joven + espera corta)", () => {
      const contexto: DecisionContext = {
        tipo: "prioridad_cita",
        peso: "HIGH",
        datos: {
          motivo: "dolor fuerte",
          edad: 30,
          tiempoEsperaDias: 2,
        },
      };

      const resultado = engine.evaluar(contexto);

      expect(resultado.autonomyLevel).toBe("BLOCKED");
      expect(resultado.requiereIntervencionHumana).toBe(true);
    });
  });

  describe("Decisiones MEDIUM", () => {
    it("debe ser AUTOMATIC cuando no hay ambigüedad", () => {
      const contexto: DecisionContext = {
        tipo: "prioridad_cita",
        peso: "MEDIUM",
        datos: {
          motivo: "control rutinario",
          edad: 30,
          tiempoEsperaDias: 5,
        },
      };

      const resultado = engine.evaluar(contexto);

      expect(resultado.autonomyLevel).toBe("AUTOMATIC");
    });

    it("debe ser AUTOMATIC con ambigüedad leve (MEDIUM no escala a SUPERVISED)", () => {
      const contexto: DecisionContext = {
        tipo: "prioridad_cita",
        peso: "MEDIUM",
        datos: {
          motivo: "control general",
          edad: 30,
          tiempoEsperaDias: 20,
        },
      };

      const resultado = engine.evaluar(contexto);

      // Con peso MEDIUM, la ambigüedad leve no escala a SUPERVISED
      expect(resultado.autonomyLevel).toBe("AUTOMATIC");
      expect(resultado.requiereIntervencionHumana).toBe(true);
    });

    it("debe ser BLOCKED con indicadores contradictorios extremos", () => {
      const contexto: DecisionContext = {
        tipo: "prioridad_cita",
        peso: "MEDIUM",
        datos: {
          motivo: "dolor fuerte",
          edad: 30,
          tiempoEsperaDias: 2,
        },
      };

      const resultado = engine.evaluar(contexto);

      expect(resultado.autonomyLevel).toBe("BLOCKED");
    });
  });

  describe("Tipo de decisión desconocido", () => {
    it("debe ser BLOCKED para tipos no reconocidos", () => {
      const contexto: DecisionContext = {
        tipo: "tipo_desconocido",
        datos: {},
      };

      const resultado = engine.evaluar(contexto);

      expect(resultado.autonomyLevel).toBe("BLOCKED");
      expect(resultado.razonIntervencion).toContain("Tipo de decisión desconocido");
    });
  });
});

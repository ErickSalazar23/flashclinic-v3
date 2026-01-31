import { SolicitarCitaUseCase } from "./SolicitarCitaUseCase";
import { PublicarEventoPort } from "../ports/PublicarEventoPort";
import { GuardarPendingDecisionPort } from "../ports/GuardarPendingDecisionPort";
import { PendingDecision } from "../domain/entities/PendingDecision";

describe("SolicitarCitaUseCase - Flujo de Decisión", () => {
  let useCase: SolicitarCitaUseCase;
  let publicarEventoPort: PublicarEventoPort;
  let guardarPendingDecisionPort: GuardarPendingDecisionPort;
  let decisionesGuardadas: PendingDecision[];

  beforeEach(() => {
    decisionesGuardadas = [];

    publicarEventoPort = {
      publicar: jest.fn().mockResolvedValue(undefined),
    } as unknown as PublicarEventoPort;

    guardarPendingDecisionPort = {
      guardar: jest.fn().mockImplementation((pendingDecision: PendingDecision) => {
        decisionesGuardadas.push(pendingDecision);
        return Promise.resolve();
      }),
    } as unknown as GuardarPendingDecisionPort;

    useCase = new SolicitarCitaUseCase(
      publicarEventoPort,
      guardarPendingDecisionPort
    );
  });

  describe("Decisión BLOCKED", () => {
    it("debe generar PendingDecision cuando hay indicadores contradictorios", async () => {
      const command = {
        id: "cita-123",
        pacienteId: "paciente-456",
        especialidad: "Cardiología",
        fechaHora: new Date(Date.now() + 86400000 * 30),
        motivo: "dolor fuerte",
        edad: 30,
        tiempoEsperaDias: 2,
      };

      const resultado = await useCase.execute(command);

      expect(resultado.ok).toBe(false);
      if (!resultado.ok && "estado" in resultado) {
        expect(resultado.estado).toBe("criterio_pendiente");
        expect(resultado.pendingDecisionId).toBeDefined();
      }

      expect(guardarPendingDecisionPort.guardar).toHaveBeenCalledTimes(1);
      expect(decisionesGuardadas.length).toBe(1);

      const pendingDecision = decisionesGuardadas[0];
      expect(pendingDecision.autonomyLevel).toBe("BLOCKED");
      expect(pendingDecision.razon).toBeDefined();
      expect(pendingDecision.decisionContext.tipo).toBe("prioridad_cita");
    });

    it("debe incluir los datos de solicitud en metadata para posterior aprobación", async () => {
      const command = {
        id: "cita-meta-test",
        pacienteId: "paciente-789",
        especialidad: "Neurología",
        fechaHora: new Date(Date.now() + 86400000 * 30),
        motivo: "dolor fuerte",
        edad: 30,
        tiempoEsperaDias: 2,
      };

      await useCase.execute(command);

      const pendingDecision = decisionesGuardadas[0];
      const metadata = pendingDecision.decisionContext.metadata as {
        solicitudCita?: {
          id: string;
          pacienteId: string;
          especialidad: string;
          fechaHora: string;
        };
      };

      expect(metadata).toBeDefined();
      expect(metadata.solicitudCita).toBeDefined();
      expect(metadata.solicitudCita?.id).toBe("cita-meta-test");
      expect(metadata.solicitudCita?.pacienteId).toBe("paciente-789");
      expect(metadata.solicitudCita?.especialidad).toBe("Neurología");
    });
  });

  describe("Ambigüedad leve (no genera PendingDecision)", () => {
    it("debe procesar automáticamente cuando hay ambigüedad leve sin indicadores contradictorios", async () => {
      // Con peso MEDIUM (default), la ambigüedad leve no genera PendingDecision
      // Solo indicadores contradictorios extremos generan BLOCKED
      const command = {
        id: "cita-456",
        pacienteId: "paciente-789",
        especialidad: "Neurología",
        fechaHora: new Date(Date.now() + 86400000 * 30),
        motivo: "control general",
        edad: 70,
        tiempoEsperaDias: 10,
      };

      const resultado = await useCase.execute(command);

      // Con peso MEDIUM, no se escala a SUPERVISED, se procesa automáticamente
      expect(resultado.ok).toBe(true);
      if (resultado.ok) {
        expect(resultado.value.id).toBe("cita-456");
      }
    });
  });

  describe("Decisión AUTOMATIC", () => {
    it("no debe generar PendingDecision y debe crear cita directamente", async () => {
      const command = {
        id: "cita-789",
        pacienteId: "paciente-123",
        especialidad: "Medicina General",
        fechaHora: new Date(Date.now() + 86400000 * 30),
        motivo: "control rutinario",
        edad: 30,
        tiempoEsperaDias: 5,
      };

      const resultado = await useCase.execute(command);

      expect(guardarPendingDecisionPort.guardar).not.toHaveBeenCalled();
      expect(decisionesGuardadas.length).toBe(0);

      expect(resultado.ok).toBe(true);
      if (resultado.ok) {
        expect(resultado.value).toBeDefined();
        expect(resultado.value.id).toBe("cita-789");
        expect(publicarEventoPort.publicar).toHaveBeenCalledTimes(1);
      }
    });

    it("debe crear cita con prioridad calculada automáticamente", async () => {
      const command = {
        id: "cita-auto",
        pacienteId: "paciente-auto",
        especialidad: "Dermatología",
        fechaHora: new Date(Date.now() + 86400000 * 30),
        motivo: "revisión rutinaria",
        edad: 25,
        tiempoEsperaDias: 7,
      };

      const resultado = await useCase.execute(command);

      expect(resultado.ok).toBe(true);
      if (resultado.ok) {
        expect(resultado.value.prioridad).toBeDefined();
        expect(["Alta", "Media", "Baja"]).toContain(resultado.value.prioridad);
      }
    });
  });
});

import { AprobarSolicitudCita } from "./AprobarSolicitudCita";
import { ObtenerPendingDecisionPort } from "../ports/ObtenerPendingDecisionPort";
import { EliminarPendingDecisionPort } from "../ports/EliminarPendingDecisionPort";
import { ObtenerCitaPort } from "../ports/ObtenerCitaPort";
import { GuardarCitaPort } from "../ports/GuardarCitaPort";
import { PublicarEventoPort } from "../ports/PublicarEventoPort";
import { PendingDecision } from "../domain/entities/PendingDecision";
import { Cita } from "../domain/entities/Cita";

describe("AprobarSolicitudCita - Idempotencia", () => {
  let useCase: AprobarSolicitudCita;
  let obtenerPendingDecisionPort: jest.Mocked<ObtenerPendingDecisionPort>;
  let eliminarPendingDecisionPort: jest.Mocked<EliminarPendingDecisionPort>;
  let obtenerCitaPort: jest.Mocked<ObtenerCitaPort>;
  let guardarCitaPort: jest.Mocked<GuardarCitaPort>;
  let publicarEventoPort: jest.Mocked<PublicarEventoPort>;

  const validPendingDecision = new PendingDecision({
    id: "pending-123",
    decisionContext: {
      tipo: "prioridad_cita",
      datos: {
        motivo: "dolor fuerte",
        edad: 30,
        tiempoEsperaDias: 2,
      },
      metadata: {
        solicitudCita: {
          id: "cita-001",
          pacienteId: "paciente-001",
          especialidad: "Cardiología",
          fechaHora: new Date(Date.now() + 86400000 * 30).toISOString(),
        },
      },
    },
    decisionResult: {
      opciones: [
        { id: "alta", valor: "Alta", confianza: 0.9, razones: ["Urgencia"] },
      ],
      tradeoffs: [],
      recomendacionPrincipal: {
        id: "alta",
        valor: "Alta",
        confianza: 0.9,
        razones: ["Urgencia"],
      },
      requiereIntervencionHumana: true,
      razonIntervencion: "Indicadores contradictorios",
      autonomyLevel: "BLOCKED",
    },
    autonomyLevel: "BLOCKED",
    razon: "Indicadores contradictorios",
    creadoEn: new Date(),
  });

  beforeEach(() => {
    obtenerPendingDecisionPort = {
      obtenerPorId: jest.fn(),
    };
    eliminarPendingDecisionPort = {
      eliminar: jest.fn().mockResolvedValue(undefined),
    };
    obtenerCitaPort = {
      obtenerPorId: jest.fn(),
    };
    guardarCitaPort = {
      guardar: jest.fn().mockResolvedValue(undefined),
    };
    publicarEventoPort = {
      publicar: jest.fn().mockResolvedValue(undefined),
    };

    useCase = new AprobarSolicitudCita(
      obtenerPendingDecisionPort,
      eliminarPendingDecisionPort,
      obtenerCitaPort,
      guardarCitaPort,
      publicarEventoPort
    );
  });

  describe("Primera aprobación (caso exitoso)", () => {
    it("debe crear la cita cuando la decisión es válida y no fue procesada", async () => {
      obtenerPendingDecisionPort.obtenerPorId.mockResolvedValue(validPendingDecision);
      obtenerCitaPort.obtenerPorId.mockResolvedValue(null);

      const resultado = await useCase.execute({ decisionId: "pending-123" });

      expect(resultado.ok).toBe(true);
      if (resultado.ok) {
        expect(resultado.value.id).toBe("cita-001");
        expect(resultado.value.pacienteId).toBe("paciente-001");
        expect(resultado.value.especialidad).toBe("Cardiología");
        expect(resultado.value.estado).toBe("Confirmada");
        expect(resultado.value.prioridad).toBe("Alta");
      }

      expect(guardarCitaPort.guardar).toHaveBeenCalledTimes(1);
      expect(publicarEventoPort.publicar).toHaveBeenCalledTimes(1);
      expect(eliminarPendingDecisionPort.eliminar).toHaveBeenCalledWith("pending-123");
    });
  });

  describe("Segunda aprobación (idempotencia)", () => {
    it("debe retornar error ya_aprobada cuando la cita ya existe", async () => {
      const citaExistente = new Cita({
        id: "cita-001",
        pacienteId: "paciente-001",
        especialidad: "Cardiología",
        fechaHora: new Date(Date.now() + 86400000 * 30),
        prioridadInicial: "Alta",
        creadoEn: new Date(),
      });

      obtenerPendingDecisionPort.obtenerPorId.mockResolvedValue(validPendingDecision);
      obtenerCitaPort.obtenerPorId.mockResolvedValue(citaExistente);

      const resultado = await useCase.execute({ decisionId: "pending-123" });

      expect(resultado.ok).toBe(false);
      if (!resultado.ok && "estado" in resultado) {
        expect(resultado.estado).toBe("ya_aprobada");
        expect(resultado.error).toBe("La solicitud de cita ya fue aprobada previamente");
      }

      expect(guardarCitaPort.guardar).not.toHaveBeenCalled();
      expect(publicarEventoPort.publicar).not.toHaveBeenCalled();
      expect(eliminarPendingDecisionPort.eliminar).not.toHaveBeenCalled();
    });

    it("debe retornar error cuando la decisión no existe (ya fue eliminada)", async () => {
      obtenerPendingDecisionPort.obtenerPorId.mockResolvedValue(null);

      const resultado = await useCase.execute({ decisionId: "pending-inexistente" });

      expect(resultado.ok).toBe(false);
      if (!resultado.ok) {
        expect(resultado.error).toContain("Decisión pendiente no encontrada");
      }

      expect(guardarCitaPort.guardar).not.toHaveBeenCalled();
    });
  });

  describe("Validaciones de datos", () => {
    it("debe retornar error cuando la decisión no contiene metadata de solicitud", async () => {
      const decisionSinMetadata = new PendingDecision({
        id: "pending-sin-meta",
        decisionContext: {
          tipo: "prioridad_cita",
          datos: { motivo: "test", edad: 30, tiempoEsperaDias: 5 },
        },
        decisionResult: {
          opciones: [],
          tradeoffs: [],
          recomendacionPrincipal: { id: "alta", valor: "Alta", confianza: 0.9, razones: [] },
          requiereIntervencionHumana: true,
          autonomyLevel: "BLOCKED",
        },
        autonomyLevel: "BLOCKED",
        razon: "Test",
        creadoEn: new Date(),
      });

      obtenerPendingDecisionPort.obtenerPorId.mockResolvedValue(decisionSinMetadata);
      obtenerCitaPort.obtenerPorId.mockResolvedValue(null);

      const resultado = await useCase.execute({ decisionId: "pending-sin-meta" });

      expect(resultado.ok).toBe(false);
      if (!resultado.ok) {
        expect(resultado.error).toContain("no contiene datos de solicitud");
      }
    });
  });
});

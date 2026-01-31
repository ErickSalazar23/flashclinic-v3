import {
  SobrescribirPrioridadCita,
  SobrescribirPrioridadCitaCommand,
} from "./SobrescribirPrioridadCita";
import { Cita, PrioridadCita } from "../domain/entities/Cita";
import { ObtenerCitaPort } from "../ports/ObtenerCitaPort";
import { GuardarCitaPort } from "../ports/GuardarCitaPort";
import { PublicarEventoPort, DomainEvent } from "../ports/PublicarEventoPort";
import { PrioridadCitaSobrescritaPorHumano } from "../domain/events/PrioridadCitaSobrescritaPorHumano";

class FakeObtenerCitaPort implements ObtenerCitaPort {
  private citas: Map<string, Cita> = new Map();

  agregarCita(cita: Cita): void {
    this.citas.set(cita.id, cita);
  }

  async obtenerPorId(citaId: string): Promise<Cita | null> {
    return this.citas.get(citaId) || null;
  }
}

class FakeGuardarCitaPort implements GuardarCitaPort {
  public citasGuardadas: Cita[] = [];

  async guardar(cita: Cita): Promise<void> {
    this.citasGuardadas.push(cita);
  }
}

class FakePublicarEventoPort implements PublicarEventoPort {
  public eventosPublicados: DomainEvent[] = [];

  async publicar(evento: DomainEvent): Promise<void> {
    this.eventosPublicados.push(evento);
  }
}

function crearCitaSolicitada(
  id: string,
  fechaHora: Date,
  prioridad: PrioridadCita
): Cita {
  const creadoEn = new Date(Date.now() - 10000);

  return new Cita({
    id,
    pacienteId: "paciente-123",
    especialidad: "Cardiología",
    fechaHora,
    prioridadInicial: prioridad,
    creadoEn,
  });
}

describe("SobrescribirPrioridadCita", () => {
  let useCase: SobrescribirPrioridadCita;
  let obtenerCitaPort: FakeObtenerCitaPort;
  let guardarCitaPort: FakeGuardarCitaPort;
  let publicarEventoPort: FakePublicarEventoPort;

  beforeEach(() => {
    obtenerCitaPort = new FakeObtenerCitaPort();
    guardarCitaPort = new FakeGuardarCitaPort();
    publicarEventoPort = new FakePublicarEventoPort();

    useCase = new SobrescribirPrioridadCita(
      obtenerCitaPort,
      guardarCitaPort,
      publicarEventoPort
    );
  });

  describe("Inmutabilidad", () => {
    it("la cita original no se muta, se retorna una nueva instancia", async () => {
      const citaId = "cita-001";
      const fechaHora = new Date(Date.now() + 86400000);
      const citaOriginal = crearCitaSolicitada(citaId, fechaHora, "Baja");
      obtenerCitaPort.agregarCita(citaOriginal);

      const command: SobrescribirPrioridadCitaCommand = {
        citaId,
        nuevaPrioridad: "Alta",
        justificacion: "Paciente presenta síntomas de urgencia",
        modificadoPor: "doctor-456",
      };

      const resultado = await useCase.execute(command);

      expect(resultado.ok).toBe(true);
      if (resultado.ok) {
        expect(resultado.value).not.toBe(citaOriginal);
        expect(resultado.value.id).toBe(citaOriginal.id);
      }
    });

    it("la identidad de la cita se preserva después de sobrescribir prioridad", async () => {
      const citaId = "cita-002";
      const fechaHora = new Date(Date.now() + 86400000);
      const citaOriginal = crearCitaSolicitada(citaId, fechaHora, "Baja");
      obtenerCitaPort.agregarCita(citaOriginal);

      const command: SobrescribirPrioridadCitaCommand = {
        citaId,
        nuevaPrioridad: "Alta",
        justificacion: "Evaluación clínica indica mayor urgencia",
        modificadoPor: "doctor-789",
      };

      const resultado = await useCase.execute(command);

      expect(resultado.ok).toBe(true);
      if (resultado.ok) {
        expect(resultado.value.id).toBe(citaId);
        expect(resultado.value.pacienteId).toBe(citaOriginal.pacienteId);
        expect(resultado.value.especialidad).toBe(citaOriginal.especialidad);
        expect(resultado.value.creadoEn.getTime()).toBe(
          citaOriginal.creadoEn.getTime()
        );
      }
    });
  });

  describe("Cambio de prioridad", () => {
    it("la nueva cita tiene la prioridad sobrescrita", async () => {
      const citaId = "cita-003";
      const fechaHora = new Date(Date.now() + 86400000);
      const citaOriginal = crearCitaSolicitada(citaId, fechaHora, "Baja");
      obtenerCitaPort.agregarCita(citaOriginal);

      const command: SobrescribirPrioridadCitaCommand = {
        citaId,
        nuevaPrioridad: "Alta",
        justificacion: "Condición del paciente empeoró",
        modificadoPor: "doctor-001",
      };

      const resultado = await useCase.execute(command);

      expect(resultado.ok).toBe(true);
      if (resultado.ok) {
        expect(resultado.value.prioridad).toBe("Alta");
      }
    });

    it("el historial de prioridad registra el cambio con origen Humano", async () => {
      const citaId = "cita-004";
      const fechaHora = new Date(Date.now() + 86400000);
      const citaOriginal = crearCitaSolicitada(citaId, fechaHora, "Baja");
      obtenerCitaPort.agregarCita(citaOriginal);

      const command: SobrescribirPrioridadCitaCommand = {
        citaId,
        nuevaPrioridad: "Media",
        justificacion: "Revisión médica indica prioridad intermedia",
        modificadoPor: "doctor-002",
      };

      const resultado = await useCase.execute(command);

      expect(resultado.ok).toBe(true);
      if (resultado.ok) {
        const historial = resultado.value.historialPrioridad;
        expect(historial.length).toBe(2);

        const ultimoRegistro = historial[historial.length - 1];
        expect(ultimoRegistro.prioridad).toBe("Media");
        expect(ultimoRegistro.origen).toBe("Humano");
        expect(ultimoRegistro.justificacion).toBe(
          "Revisión médica indica prioridad intermedia"
        );
        expect(ultimoRegistro.modificadoPor).toBe("doctor-002");
      }
    });
  });

  describe("Evento emitido", () => {
    it("emite PrioridadCitaSobrescritaPorHumano con los datos correctos", async () => {
      const citaId = "cita-005";
      const fechaHora = new Date(Date.now() + 86400000);
      const citaOriginal = crearCitaSolicitada(citaId, fechaHora, "Baja");
      obtenerCitaPort.agregarCita(citaOriginal);

      const command: SobrescribirPrioridadCitaCommand = {
        citaId,
        nuevaPrioridad: "Alta",
        justificacion: "Urgencia detectada en evaluación",
        modificadoPor: "doctor-003",
      };

      await useCase.execute(command);

      expect(publicarEventoPort.eventosPublicados.length).toBe(1);

      const evento = publicarEventoPort
        .eventosPublicados[0] as PrioridadCitaSobrescritaPorHumano;

      expect(evento).toBeInstanceOf(PrioridadCitaSobrescritaPorHumano);
      expect(evento.citaId).toBe(citaId);
      expect(evento.prioridadAnterior).toBe("Baja");
      expect(evento.prioridadNueva).toBe("Alta");
      expect(evento.justificacion).toBe("Urgencia detectada en evaluación");
      expect(evento.modificadoPor).toBe("doctor-003");
      expect(evento.ocurrioEn).toBeInstanceOf(Date);
    });

    it("el evento se publica antes de guardar la cita", async () => {
      const citaId = "cita-006";
      const fechaHora = new Date(Date.now() + 86400000);
      const citaOriginal = crearCitaSolicitada(citaId, fechaHora, "Media");
      obtenerCitaPort.agregarCita(citaOriginal);

      const ordenOperaciones: string[] = [];

      publicarEventoPort.publicar = async () => {
        ordenOperaciones.push("publicar");
      };
      guardarCitaPort.guardar = async () => {
        ordenOperaciones.push("guardar");
      };

      const command: SobrescribirPrioridadCitaCommand = {
        citaId,
        nuevaPrioridad: "Alta",
        justificacion: "Justificación válida",
        modificadoPor: "doctor-004",
      };

      await useCase.execute(command);

      expect(ordenOperaciones).toEqual(["publicar", "guardar"]);
    });
  });

  describe("Validaciones", () => {
    it("retorna error si la cita no existe", async () => {
      const command: SobrescribirPrioridadCitaCommand = {
        citaId: "cita-inexistente",
        nuevaPrioridad: "Alta",
        justificacion: "Justificación válida",
        modificadoPor: "doctor-005",
      };

      const resultado = await useCase.execute(command);

      expect(resultado.ok).toBe(false);
      if (!resultado.ok) {
        expect(resultado.error).toContain("No se encontró la cita");
      }
    });

    it("retorna error si la justificación está vacía", async () => {
      const citaId = "cita-007";
      const fechaHora = new Date(Date.now() + 86400000);
      const citaOriginal = crearCitaSolicitada(citaId, fechaHora, "Baja");
      obtenerCitaPort.agregarCita(citaOriginal);

      const command: SobrescribirPrioridadCitaCommand = {
        citaId,
        nuevaPrioridad: "Alta",
        justificacion: "",
        modificadoPor: "doctor-006",
      };

      const resultado = await useCase.execute(command);

      expect(resultado.ok).toBe(false);
      if (!resultado.ok) {
        expect(resultado.error).toContain("justificación");
      }
    });

    it("retorna error si modificadoPor está vacío", async () => {
      const citaId = "cita-008";
      const fechaHora = new Date(Date.now() + 86400000);
      const citaOriginal = crearCitaSolicitada(citaId, fechaHora, "Baja");
      obtenerCitaPort.agregarCita(citaOriginal);

      const command: SobrescribirPrioridadCitaCommand = {
        citaId,
        nuevaPrioridad: "Alta",
        justificacion: "Justificación válida",
        modificadoPor: "",
      };

      const resultado = await useCase.execute(command);

      expect(resultado.ok).toBe(false);
      if (!resultado.ok) {
        expect(resultado.error).toContain("modificador");
      }
    });

    it("retorna error si se intenta cambiar a la misma prioridad", async () => {
      const citaId = "cita-009";
      const fechaHora = new Date(Date.now() + 86400000);
      const citaOriginal = crearCitaSolicitada(citaId, fechaHora, "Alta");
      obtenerCitaPort.agregarCita(citaOriginal);

      const command: SobrescribirPrioridadCitaCommand = {
        citaId,
        nuevaPrioridad: "Alta",
        justificacion: "Justificación válida",
        modificadoPor: "doctor-007",
      };

      const resultado = await useCase.execute(command);

      expect(resultado.ok).toBe(false);
      if (!resultado.ok) {
        expect(resultado.error).toContain("misma prioridad");
      }
    });
  });

  describe("Persistencia", () => {
    it("guarda la cita actualizada en el repositorio", async () => {
      const citaId = "cita-010";
      const fechaHora = new Date(Date.now() + 86400000);
      const citaOriginal = crearCitaSolicitada(citaId, fechaHora, "Baja");
      obtenerCitaPort.agregarCita(citaOriginal);

      const command: SobrescribirPrioridadCitaCommand = {
        citaId,
        nuevaPrioridad: "Alta",
        justificacion: "Justificación para guardar",
        modificadoPor: "doctor-008",
      };

      await useCase.execute(command);

      expect(guardarCitaPort.citasGuardadas.length).toBe(1);
      expect(guardarCitaPort.citasGuardadas[0].id).toBe(citaId);
      expect(guardarCitaPort.citasGuardadas[0].prioridad).toBe("Alta");
    });
  });
});

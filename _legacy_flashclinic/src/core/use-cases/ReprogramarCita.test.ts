import { ReprogramarCita, ReprogramarCitaCommand } from "./ReprogramarCita";
import { Cita } from "../domain/entities/Cita";
import { ObtenerCitaPort } from "../ports/ObtenerCitaPort";
import { GuardarCitaPort } from "../ports/GuardarCitaPort";
import { PublicarEventoPort, DomainEvent } from "../ports/PublicarEventoPort";
import { EstadoCitaCambiado } from "../domain/events/EstadoCitaCambiado";
import { CitaReprogramada } from "../domain/events/CitaReprogramada";
import { CitaSolicitada } from "../domain/events/CitaSolicitada";

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

function crearCitaConfirmada(id: string, fechaHora: Date): Cita {
  const creadoEn = new Date(Date.now() - 10000);
  const confirmadoEn = new Date(Date.now() - 5000);

  const cita = new Cita({
    id,
    pacienteId: "paciente-123",
    especialidad: "Cardiología",
    fechaHora,
    prioridadInicial: "Media",
    creadoEn,
  });

  const { nuevaCita } = cita.cambiarEstado("Confirmada", confirmadoEn);
  return nuevaCita;
}

describe("ReprogramarCita", () => {
  let useCase: ReprogramarCita;
  let obtenerCitaPort: FakeObtenerCitaPort;
  let guardarCitaPort: FakeGuardarCitaPort;
  let publicarEventoPort: FakePublicarEventoPort;

  beforeEach(() => {
    obtenerCitaPort = new FakeObtenerCitaPort();
    guardarCitaPort = new FakeGuardarCitaPort();
    publicarEventoPort = new FakePublicarEventoPort();

    useCase = new ReprogramarCita(
      obtenerCitaPort,
      guardarCitaPort,
      publicarEventoPort
    );
  });

  describe("Inmutabilidad de identidad", () => {
    it("la cita original nunca cambia su identidad", async () => {
      const citaOriginalId = "cita-original-001";
      const nuevaCitaId = "cita-nueva-002";
      const fechaOriginal = new Date(Date.now() + 86400000);
      const nuevaFecha = new Date(Date.now() + 172800000);

      const citaConfirmada = crearCitaConfirmada(citaOriginalId, fechaOriginal);
      obtenerCitaPort.agregarCita(citaConfirmada);

      const command: ReprogramarCitaCommand = {
        citaId: citaOriginalId,
        nuevaCitaId,
        nuevaFechaHora: nuevaFecha,
      };

      const resultado = await useCase.execute(command);

      expect(resultado.ok).toBe(true);
      if (resultado.ok) {
        expect(resultado.value.citaOriginal.id).toBe(citaOriginalId);
        expect(resultado.value.citaOriginal.pacienteId).toBe("paciente-123");
        expect(resultado.value.citaOriginal.especialidad).toBe("Cardiología");

        expect(resultado.value.citaNueva.id).toBe(nuevaCitaId);
        expect(resultado.value.citaNueva.id).not.toBe(citaOriginalId);
      }
    });

    it("la cita original conserva su fecha de creación original", async () => {
      const citaOriginalId = "cita-original-002";
      const nuevaCitaId = "cita-nueva-003";
      const fechaOriginal = new Date(Date.now() + 86400000);
      const nuevaFecha = new Date(Date.now() + 172800000);

      const citaConfirmada = crearCitaConfirmada(citaOriginalId, fechaOriginal);
      const fechaCreacionOriginal = citaConfirmada.creadoEn;
      obtenerCitaPort.agregarCita(citaConfirmada);

      const command: ReprogramarCitaCommand = {
        citaId: citaOriginalId,
        nuevaCitaId,
        nuevaFechaHora: nuevaFecha,
      };

      const resultado = await useCase.execute(command);

      expect(resultado.ok).toBe(true);
      if (resultado.ok) {
        expect(resultado.value.citaOriginal.creadoEn.getTime()).toBe(
          fechaCreacionOriginal.getTime()
        );
      }
    });
  });

  describe("Estado inicial de nueva cita", () => {
    it("la nueva cita inicia en estado Solicitada", async () => {
      const citaOriginalId = "cita-original-003";
      const nuevaCitaId = "cita-nueva-004";
      const fechaOriginal = new Date(Date.now() + 86400000);
      const nuevaFecha = new Date(Date.now() + 172800000);

      const citaConfirmada = crearCitaConfirmada(citaOriginalId, fechaOriginal);
      obtenerCitaPort.agregarCita(citaConfirmada);

      const command: ReprogramarCitaCommand = {
        citaId: citaOriginalId,
        nuevaCitaId,
        nuevaFechaHora: nuevaFecha,
      };

      const resultado = await useCase.execute(command);

      expect(resultado.ok).toBe(true);
      if (resultado.ok) {
        expect(resultado.value.citaNueva.estado).toBe("Solicitada");
      }
    });

    it("la nueva cita hereda pacienteId y especialidad de la original", async () => {
      const citaOriginalId = "cita-original-004";
      const nuevaCitaId = "cita-nueva-005";
      const fechaOriginal = new Date(Date.now() + 86400000);
      const nuevaFecha = new Date(Date.now() + 172800000);

      const citaConfirmada = crearCitaConfirmada(citaOriginalId, fechaOriginal);
      obtenerCitaPort.agregarCita(citaConfirmada);

      const command: ReprogramarCitaCommand = {
        citaId: citaOriginalId,
        nuevaCitaId,
        nuevaFechaHora: nuevaFecha,
      };

      const resultado = await useCase.execute(command);

      expect(resultado.ok).toBe(true);
      if (resultado.ok) {
        expect(resultado.value.citaNueva.pacienteId).toBe(
          citaConfirmada.pacienteId
        );
        expect(resultado.value.citaNueva.especialidad).toBe(
          citaConfirmada.especialidad
        );
        expect(resultado.value.citaNueva.prioridad).toBe(
          citaConfirmada.prioridad
        );
      }
    });

    it("la cita original pasa a estado Reprogramada", async () => {
      const citaOriginalId = "cita-original-005";
      const nuevaCitaId = "cita-nueva-006";
      const fechaOriginal = new Date(Date.now() + 86400000);
      const nuevaFecha = new Date(Date.now() + 172800000);

      const citaConfirmada = crearCitaConfirmada(citaOriginalId, fechaOriginal);
      obtenerCitaPort.agregarCita(citaConfirmada);

      const command: ReprogramarCitaCommand = {
        citaId: citaOriginalId,
        nuevaCitaId,
        nuevaFechaHora: nuevaFecha,
      };

      const resultado = await useCase.execute(command);

      expect(resultado.ok).toBe(true);
      if (resultado.ok) {
        expect(resultado.value.citaOriginal.estado).toBe("Reprogramada");
      }
    });
  });

  describe("Orden de eventos", () => {
    it("los eventos se emiten en el orden correcto: EstadoCitaCambiado, CitaReprogramada, CitaSolicitada", async () => {
      const citaOriginalId = "cita-original-006";
      const nuevaCitaId = "cita-nueva-007";
      const fechaOriginal = new Date(Date.now() + 86400000);
      const nuevaFecha = new Date(Date.now() + 172800000);

      const citaConfirmada = crearCitaConfirmada(citaOriginalId, fechaOriginal);
      obtenerCitaPort.agregarCita(citaConfirmada);

      const command: ReprogramarCitaCommand = {
        citaId: citaOriginalId,
        nuevaCitaId,
        nuevaFechaHora: nuevaFecha,
      };

      await useCase.execute(command);

      expect(publicarEventoPort.eventosPublicados.length).toBe(3);

      const [primerEvento, segundoEvento, tercerEvento] =
        publicarEventoPort.eventosPublicados;

      expect(primerEvento).toBeInstanceOf(EstadoCitaCambiado);
      expect(segundoEvento).toBeInstanceOf(CitaReprogramada);
      expect(tercerEvento).toBeInstanceOf(CitaSolicitada);
    });

    it("EstadoCitaCambiado contiene la transición Confirmada → Reprogramada", async () => {
      const citaOriginalId = "cita-original-007";
      const nuevaCitaId = "cita-nueva-008";
      const fechaOriginal = new Date(Date.now() + 86400000);
      const nuevaFecha = new Date(Date.now() + 172800000);

      const citaConfirmada = crearCitaConfirmada(citaOriginalId, fechaOriginal);
      obtenerCitaPort.agregarCita(citaConfirmada);

      const command: ReprogramarCitaCommand = {
        citaId: citaOriginalId,
        nuevaCitaId,
        nuevaFechaHora: nuevaFecha,
      };

      await useCase.execute(command);

      const estadoCambiado = publicarEventoPort
        .eventosPublicados[0] as EstadoCitaCambiado;

      expect(estadoCambiado.citaId).toBe(citaOriginalId);
      expect(estadoCambiado.estadoAnterior).toBe("Confirmada");
      expect(estadoCambiado.estadoNuevo).toBe("Reprogramada");
    });

    it("CitaReprogramada contiene las fechas anterior y nueva", async () => {
      const citaOriginalId = "cita-original-008";
      const nuevaCitaId = "cita-nueva-009";
      const fechaOriginal = new Date(Date.now() + 86400000);
      const nuevaFecha = new Date(Date.now() + 172800000);

      const citaConfirmada = crearCitaConfirmada(citaOriginalId, fechaOriginal);
      obtenerCitaPort.agregarCita(citaConfirmada);

      const command: ReprogramarCitaCommand = {
        citaId: citaOriginalId,
        nuevaCitaId,
        nuevaFechaHora: nuevaFecha,
      };

      await useCase.execute(command);

      const citaReprogramada = publicarEventoPort
        .eventosPublicados[1] as CitaReprogramada;

      expect(citaReprogramada.citaId).toBe(citaOriginalId);
      expect(citaReprogramada.fechaHoraAnterior.getTime()).toBe(
        fechaOriginal.getTime()
      );
      expect(citaReprogramada.fechaHoraNueva.getTime()).toBe(
        nuevaFecha.getTime()
      );
    });

    it("CitaSolicitada contiene los datos de la nueva cita", async () => {
      const citaOriginalId = "cita-original-009";
      const nuevaCitaId = "cita-nueva-010";
      const fechaOriginal = new Date(Date.now() + 86400000);
      const nuevaFecha = new Date(Date.now() + 172800000);

      const citaConfirmada = crearCitaConfirmada(citaOriginalId, fechaOriginal);
      obtenerCitaPort.agregarCita(citaConfirmada);

      const command: ReprogramarCitaCommand = {
        citaId: citaOriginalId,
        nuevaCitaId,
        nuevaFechaHora: nuevaFecha,
      };

      await useCase.execute(command);

      const citaSolicitada = publicarEventoPort
        .eventosPublicados[2] as CitaSolicitada;

      expect(citaSolicitada.citaId).toBe(nuevaCitaId);
      expect(citaSolicitada.pacienteId).toBe("paciente-123");
      expect(citaSolicitada.especialidad).toBe("Cardiología");
      expect(citaSolicitada.fechaHora.getTime()).toBe(nuevaFecha.getTime());
    });
  });
});

import { createServer } from "http";
import { Router } from "./router";
import { ok } from "./types";

import { SolicitarCitaUseCase } from "../../core/use-cases/SolicitarCitaUseCase";
import { ConfirmarCita } from "../../core/use-cases/ConfirmarCita";
import { ReprogramarCita } from "../../core/use-cases/ReprogramarCita";
import { MarcarCitaComoAtendida } from "../../core/use-cases/MarcarCitaComoAtendida";
import { RegistrarNoAsistencia } from "../../core/use-cases/RegistrarNoAsistencia";
import { SobrescribirPrioridadCita } from "../../core/use-cases/SobrescribirPrioridadCita";
import { CancelarCita } from "../../core/use-cases/CancelarCita";
import { ListarPacientes } from "../../core/use-cases/ListarPacientes";
import { CrearPaciente } from "../../core/use-cases/CrearPaciente";
import { ListarCitas } from "../../core/use-cases/ListarCitas";
import { ActualizarEstadoCita } from "../../core/use-cases/ActualizarEstadoCita";
import { AprobarSolicitudCita } from "../../core/use-cases/AprobarSolicitudCita";

import { SolicitarCitaController } from "./controllers/SolicitarCitaController";
import { ConfirmarCitaController } from "./controllers/ConfirmarCitaController";
import { ReprogramarCitaController } from "./controllers/ReprogramarCitaController";
import { MarcarCitaComoAtendidaController } from "./controllers/MarcarCitaComoAtendidaController";
import { RegistrarNoAsistenciaController } from "./controllers/RegistrarNoAsistenciaController";
import { SobrescribirPrioridadCitaController } from "./controllers/SobrescribirPrioridadCitaController";
import { ListarPacientesController } from "./controllers/ListarPacientesController";
import { CrearPacienteController } from "./controllers/CrearPacienteController";
import { ListarCitasController } from "./controllers/ListarCitasController";
import { ActualizarEstadoCitaController } from "./controllers/ActualizarEstadoCitaController";
import { AprobarSolicitudCitaController } from "./controllers/AprobarSolicitudCitaController";

import { InMemoryEventPublisher } from "../events/InMemoryEventPublisher";
import { InMemoryCitaRepository } from "../database/InMemoryCitaRepository";
import { InMemoryPendingDecisionRepository } from "../database/InMemoryPendingDecisionRepository";
import { InMemoryPacienteRepository } from "../database/InMemoryPacienteRepository";

import { EventDispatcher } from "../events/EventDispatcher";
import { CompositeEventPublisher } from "../events/CompositeEventPublisher";
import {
  OnCitaSolicitada,
  OnCitaCancelada,
  OnEstadoCitaCambiado,
} from "../events/handlers";

import { getSupabaseClient } from "../../infrastructure/supabase/client";
import { SupabaseCitaRepository } from "../../infrastructure/supabase/SupabaseCitaRepository";
import { SupabasePendingDecisionRepository } from "../../infrastructure/supabase/SupabasePendingDecisionRepository";
import { SupabaseEventPublisher } from "../../infrastructure/supabase/SupabaseEventPublisher";
import { SupabasePacienteRepository } from "../../infrastructure/supabase/SupabasePacienteRepository";

import { ObtenerCitaPort } from "../../core/ports/ObtenerCitaPort";
import { GuardarCitaPort } from "../../core/ports/GuardarCitaPort";
import { GuardarPendingDecisionPort } from "../../core/ports/GuardarPendingDecisionPort";
import { ObtenerPendingDecisionPort } from "../../core/ports/ObtenerPendingDecisionPort";
import { EliminarPendingDecisionPort } from "../../core/ports/EliminarPendingDecisionPort";
import { PublicarEventoPort } from "../../core/ports/PublicarEventoPort";
import { ListarCitasPort } from "../../core/ports/ListarCitasPort";
import { ObtenerPacientePort } from "../../core/ports/ObtenerPacientePort";
import { GuardarPacientePort } from "../../core/ports/GuardarPacientePort";

function createEventDispatcher(): EventDispatcher {
  const dispatcher = new EventDispatcher();

  dispatcher.register(new OnCitaSolicitada());
  dispatcher.register(new OnCitaCancelada());
  dispatcher.register(new OnEstadoCitaCambiado());

  console.log(
    `Event handlers registered for: ${dispatcher.getRegisteredEventTypes().join(", ")}`
  );

  return dispatcher;
}

function createRepositories(): {
  citaRepository: ObtenerCitaPort & GuardarCitaPort & ListarCitasPort;
  pacienteRepository: ObtenerPacientePort & GuardarPacientePort;
  pendingDecisionRepository: GuardarPendingDecisionPort & ObtenerPendingDecisionPort & EliminarPendingDecisionPort;
  eventPublisher: PublicarEventoPort;
} {
  const useSupabase = process.env.USE_SUPABASE === "true";
  const dispatcher = createEventDispatcher();

  if (useSupabase) {
    console.log("Using Supabase repositories");
    const supabase = getSupabaseClient();
    const persistencePublisher = new SupabaseEventPublisher(supabase);
    return {
      citaRepository: new SupabaseCitaRepository(supabase) as ObtenerCitaPort &
        GuardarCitaPort &
        ListarCitasPort,
      pacienteRepository: new SupabasePacienteRepository(supabase),
      pendingDecisionRepository: new SupabasePendingDecisionRepository(
        supabase
      ),
      eventPublisher: new CompositeEventPublisher(persistencePublisher, dispatcher),
    };
  }

  console.log("Using in-memory repositories");
  const persistencePublisher = new InMemoryEventPublisher();
  return {
    citaRepository: new InMemoryCitaRepository(),
    pacienteRepository: new InMemoryPacienteRepository(),
    pendingDecisionRepository: new InMemoryPendingDecisionRepository(),
    eventPublisher: new CompositeEventPublisher(persistencePublisher, dispatcher),
  };
}

export function createHttpServer(port: number = 3000) {
  const {
    citaRepository,
    pacienteRepository,
    pendingDecisionRepository,
    eventPublisher,
  } = createRepositories();

  const solicitarCitaUseCase = new SolicitarCitaUseCase(
    eventPublisher,
    pendingDecisionRepository
  );
  const confirmarCitaUseCase = new ConfirmarCita(
    citaRepository,
    citaRepository,
    eventPublisher
  );
  const reprogramarCitaUseCase = new ReprogramarCita(
    citaRepository,
    citaRepository,
    eventPublisher
  );
  const marcarAtendidaUseCase = new MarcarCitaComoAtendida(
    citaRepository,
    citaRepository,
    eventPublisher
  );
  const registrarNoAsistenciaUseCase = new RegistrarNoAsistencia(
    citaRepository,
    citaRepository,
    eventPublisher
  );
  const sobrescribirPrioridadUseCase = new SobrescribirPrioridadCita(
    citaRepository,
    citaRepository,
    eventPublisher
  );
  const cancelarCitaUseCase = new CancelarCita(
    citaRepository,
    citaRepository,
    eventPublisher
  );

  // Aprobar solicitud
  const aprobarSolicitudCitaUseCase = new AprobarSolicitudCita(
    pendingDecisionRepository,
    pendingDecisionRepository,
    citaRepository,
    citaRepository,
    eventPublisher
  );

  // New use cases
  const listarPacientesUseCase = new ListarPacientes(pacienteRepository);
  const crearPacienteUseCase = new CrearPaciente(
    pacienteRepository,
    pacienteRepository
  );
  const listarCitasUseCase = new ListarCitas(citaRepository);
  const actualizarEstadoCitaUseCase = new ActualizarEstadoCita(
    confirmarCitaUseCase,
    cancelarCitaUseCase,
    marcarAtendidaUseCase,
    registrarNoAsistenciaUseCase
  );

  const solicitarCitaController = new SolicitarCitaController(
    solicitarCitaUseCase
  );
  const confirmarCitaController = new ConfirmarCitaController(
    confirmarCitaUseCase
  );
  const reprogramarCitaController = new ReprogramarCitaController(
    reprogramarCitaUseCase
  );
  const marcarAtendidaController = new MarcarCitaComoAtendidaController(
    marcarAtendidaUseCase
  );
  const registrarNoAsistenciaController = new RegistrarNoAsistenciaController(
    registrarNoAsistenciaUseCase
  );
  const sobrescribirPrioridadController =
    new SobrescribirPrioridadCitaController(sobrescribirPrioridadUseCase);

  // Aprobar solicitud controller
  const aprobarSolicitudCitaController = new AprobarSolicitudCitaController(
    aprobarSolicitudCitaUseCase
  );

  // New controllers
  const listarPacientesController = new ListarPacientesController(
    listarPacientesUseCase
  );
  const crearPacienteController = new CrearPacienteController(
    crearPacienteUseCase
  );
  const listarCitasController = new ListarCitasController(listarCitasUseCase);
  const actualizarEstadoCitaController = new ActualizarEstadoCitaController(
    actualizarEstadoCitaUseCase
  );

  const router = new Router();

  router.get("/health", async () => ok({ status: "ok" }));

  // Pacientes
  router.get("/pacientes", (req) => listarPacientesController.handle(req));
  router.post("/pacientes", (req) => crearPacienteController.handle(req));

  // Citas - list
  router.get("/citas", (req) => listarCitasController.handle(req));

  // Citas - update state via PATCH
  router.patch("/citas/:id", (req) =>
    actualizarEstadoCitaController.handle(req)
  );

  // Citas - existing POST endpoints
  router.post("/citas/solicitar", (req) =>
    solicitarCitaController.handle(req)
  );
  router.post("/citas/aprobar", (req) =>
    aprobarSolicitudCitaController.handle(req)
  );
  router.post("/citas/confirmar", (req) =>
    confirmarCitaController.handle(req)
  );
  router.post("/citas/reprogramar", (req) =>
    reprogramarCitaController.handle(req)
  );
  router.post("/citas/marcar-atendida", (req) =>
    marcarAtendidaController.handle(req)
  );
  router.post("/citas/registrar-no-asistencia", (req) =>
    registrarNoAsistenciaController.handle(req)
  );
  router.post("/citas/sobrescribir-prioridad", (req) =>
    sobrescribirPrioridadController.handle(req)
  );

  const server = createServer((req, res) => {
    router.handle(req, res);
  });

  return {
    start: () => {
      server.listen(port, () => {
        console.log(`Servidor HTTP escuchando en puerto ${port}`);
      });
    },
    stop: () => {
      server.close();
    },
  };
}

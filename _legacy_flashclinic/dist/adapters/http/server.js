"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHttpServer = createHttpServer;
const http_1 = require("http");
const router_1 = require("./router");
const types_1 = require("./types");
const SolicitarCitaUseCase_1 = require("../../core/use-cases/SolicitarCitaUseCase");
const ConfirmarCita_1 = require("../../core/use-cases/ConfirmarCita");
const ReprogramarCita_1 = require("../../core/use-cases/ReprogramarCita");
const MarcarCitaComoAtendida_1 = require("../../core/use-cases/MarcarCitaComoAtendida");
const RegistrarNoAsistencia_1 = require("../../core/use-cases/RegistrarNoAsistencia");
const SobrescribirPrioridadCita_1 = require("../../core/use-cases/SobrescribirPrioridadCita");
const CancelarCita_1 = require("../../core/use-cases/CancelarCita");
const ListarPacientes_1 = require("../../core/use-cases/ListarPacientes");
const CrearPaciente_1 = require("../../core/use-cases/CrearPaciente");
const ListarCitas_1 = require("../../core/use-cases/ListarCitas");
const ActualizarEstadoCita_1 = require("../../core/use-cases/ActualizarEstadoCita");
const AprobarSolicitudCita_1 = require("../../core/use-cases/AprobarSolicitudCita");
const SolicitarCitaController_1 = require("./controllers/SolicitarCitaController");
const ConfirmarCitaController_1 = require("./controllers/ConfirmarCitaController");
const ReprogramarCitaController_1 = require("./controllers/ReprogramarCitaController");
const MarcarCitaComoAtendidaController_1 = require("./controllers/MarcarCitaComoAtendidaController");
const RegistrarNoAsistenciaController_1 = require("./controllers/RegistrarNoAsistenciaController");
const SobrescribirPrioridadCitaController_1 = require("./controllers/SobrescribirPrioridadCitaController");
const ListarPacientesController_1 = require("./controllers/ListarPacientesController");
const CrearPacienteController_1 = require("./controllers/CrearPacienteController");
const ListarCitasController_1 = require("./controllers/ListarCitasController");
const ActualizarEstadoCitaController_1 = require("./controllers/ActualizarEstadoCitaController");
const AprobarSolicitudCitaController_1 = require("./controllers/AprobarSolicitudCitaController");
const InMemoryEventPublisher_1 = require("../events/InMemoryEventPublisher");
const InMemoryCitaRepository_1 = require("../database/InMemoryCitaRepository");
const InMemoryPendingDecisionRepository_1 = require("../database/InMemoryPendingDecisionRepository");
const InMemoryPacienteRepository_1 = require("../database/InMemoryPacienteRepository");
const EventDispatcher_1 = require("../events/EventDispatcher");
const CompositeEventPublisher_1 = require("../events/CompositeEventPublisher");
const handlers_1 = require("../events/handlers");
const client_1 = require("../../infrastructure/supabase/client");
const SupabaseCitaRepository_1 = require("../../infrastructure/supabase/SupabaseCitaRepository");
const SupabasePendingDecisionRepository_1 = require("../../infrastructure/supabase/SupabasePendingDecisionRepository");
const SupabaseEventPublisher_1 = require("../../infrastructure/supabase/SupabaseEventPublisher");
const SupabasePacienteRepository_1 = require("../../infrastructure/supabase/SupabasePacienteRepository");
function createEventDispatcher() {
    const dispatcher = new EventDispatcher_1.EventDispatcher();
    dispatcher.register(new handlers_1.OnCitaSolicitada());
    dispatcher.register(new handlers_1.OnCitaCancelada());
    dispatcher.register(new handlers_1.OnEstadoCitaCambiado());
    console.log(`Event handlers registered for: ${dispatcher.getRegisteredEventTypes().join(", ")}`);
    return dispatcher;
}
function createRepositories() {
    const useSupabase = process.env.USE_SUPABASE === "true";
    const dispatcher = createEventDispatcher();
    if (useSupabase) {
        console.log("Using Supabase repositories");
        const supabase = (0, client_1.getSupabaseClient)();
        const persistencePublisher = new SupabaseEventPublisher_1.SupabaseEventPublisher(supabase);
        return {
            citaRepository: new SupabaseCitaRepository_1.SupabaseCitaRepository(supabase),
            pacienteRepository: new SupabasePacienteRepository_1.SupabasePacienteRepository(supabase),
            pendingDecisionRepository: new SupabasePendingDecisionRepository_1.SupabasePendingDecisionRepository(supabase),
            eventPublisher: new CompositeEventPublisher_1.CompositeEventPublisher(persistencePublisher, dispatcher),
        };
    }
    console.log("Using in-memory repositories");
    const persistencePublisher = new InMemoryEventPublisher_1.InMemoryEventPublisher();
    return {
        citaRepository: new InMemoryCitaRepository_1.InMemoryCitaRepository(),
        pacienteRepository: new InMemoryPacienteRepository_1.InMemoryPacienteRepository(),
        pendingDecisionRepository: new InMemoryPendingDecisionRepository_1.InMemoryPendingDecisionRepository(),
        eventPublisher: new CompositeEventPublisher_1.CompositeEventPublisher(persistencePublisher, dispatcher),
    };
}
function createHttpServer(port = 3000) {
    const { citaRepository, pacienteRepository, pendingDecisionRepository, eventPublisher, } = createRepositories();
    const solicitarCitaUseCase = new SolicitarCitaUseCase_1.SolicitarCitaUseCase(eventPublisher, pendingDecisionRepository);
    const confirmarCitaUseCase = new ConfirmarCita_1.ConfirmarCita(citaRepository, citaRepository, eventPublisher);
    const reprogramarCitaUseCase = new ReprogramarCita_1.ReprogramarCita(citaRepository, citaRepository, eventPublisher);
    const marcarAtendidaUseCase = new MarcarCitaComoAtendida_1.MarcarCitaComoAtendida(citaRepository, citaRepository, eventPublisher);
    const registrarNoAsistenciaUseCase = new RegistrarNoAsistencia_1.RegistrarNoAsistencia(citaRepository, citaRepository, eventPublisher);
    const sobrescribirPrioridadUseCase = new SobrescribirPrioridadCita_1.SobrescribirPrioridadCita(citaRepository, citaRepository, eventPublisher);
    const cancelarCitaUseCase = new CancelarCita_1.CancelarCita(citaRepository, citaRepository, eventPublisher);
    // Aprobar solicitud
    const aprobarSolicitudCitaUseCase = new AprobarSolicitudCita_1.AprobarSolicitudCita(pendingDecisionRepository, pendingDecisionRepository, citaRepository, citaRepository, eventPublisher);
    // New use cases
    const listarPacientesUseCase = new ListarPacientes_1.ListarPacientes(pacienteRepository);
    const crearPacienteUseCase = new CrearPaciente_1.CrearPaciente(pacienteRepository, pacienteRepository);
    const listarCitasUseCase = new ListarCitas_1.ListarCitas(citaRepository);
    const actualizarEstadoCitaUseCase = new ActualizarEstadoCita_1.ActualizarEstadoCita(confirmarCitaUseCase, cancelarCitaUseCase, marcarAtendidaUseCase, registrarNoAsistenciaUseCase);
    const solicitarCitaController = new SolicitarCitaController_1.SolicitarCitaController(solicitarCitaUseCase);
    const confirmarCitaController = new ConfirmarCitaController_1.ConfirmarCitaController(confirmarCitaUseCase);
    const reprogramarCitaController = new ReprogramarCitaController_1.ReprogramarCitaController(reprogramarCitaUseCase);
    const marcarAtendidaController = new MarcarCitaComoAtendidaController_1.MarcarCitaComoAtendidaController(marcarAtendidaUseCase);
    const registrarNoAsistenciaController = new RegistrarNoAsistenciaController_1.RegistrarNoAsistenciaController(registrarNoAsistenciaUseCase);
    const sobrescribirPrioridadController = new SobrescribirPrioridadCitaController_1.SobrescribirPrioridadCitaController(sobrescribirPrioridadUseCase);
    // Aprobar solicitud controller
    const aprobarSolicitudCitaController = new AprobarSolicitudCitaController_1.AprobarSolicitudCitaController(aprobarSolicitudCitaUseCase);
    // New controllers
    const listarPacientesController = new ListarPacientesController_1.ListarPacientesController(listarPacientesUseCase);
    const crearPacienteController = new CrearPacienteController_1.CrearPacienteController(crearPacienteUseCase);
    const listarCitasController = new ListarCitasController_1.ListarCitasController(listarCitasUseCase);
    const actualizarEstadoCitaController = new ActualizarEstadoCitaController_1.ActualizarEstadoCitaController(actualizarEstadoCitaUseCase);
    const router = new router_1.Router();
    router.get("/health", async () => (0, types_1.ok)({ status: "ok" }));
    // Pacientes
    router.get("/pacientes", (req) => listarPacientesController.handle(req));
    router.post("/pacientes", (req) => crearPacienteController.handle(req));
    // Citas - list
    router.get("/citas", (req) => listarCitasController.handle(req));
    // Citas - update state via PATCH
    router.patch("/citas/:id", (req) => actualizarEstadoCitaController.handle(req));
    // Citas - existing POST endpoints
    router.post("/citas/solicitar", (req) => solicitarCitaController.handle(req));
    router.post("/citas/aprobar", (req) => aprobarSolicitudCitaController.handle(req));
    router.post("/citas/confirmar", (req) => confirmarCitaController.handle(req));
    router.post("/citas/reprogramar", (req) => reprogramarCitaController.handle(req));
    router.post("/citas/marcar-atendida", (req) => marcarAtendidaController.handle(req));
    router.post("/citas/registrar-no-asistencia", (req) => registrarNoAsistenciaController.handle(req));
    router.post("/citas/sobrescribir-prioridad", (req) => sobrescribirPrioridadController.handle(req));
    const server = (0, http_1.createServer)((req, res) => {
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

-- Flash Clinic - Initial Database Schema
-- Run this in your Supabase SQL Editor or via migrations

-- ============================================================================
-- CITAS (Appointments) - Main aggregate root
-- ============================================================================
CREATE TABLE IF NOT EXISTS citas (
    id UUID PRIMARY KEY,
    paciente_id TEXT NOT NULL,
    especialidad TEXT NOT NULL,
    fecha_hora TIMESTAMPTZ NOT NULL,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for common queries
CREATE INDEX IF NOT EXISTS idx_citas_paciente_id ON citas(paciente_id);
CREATE INDEX IF NOT EXISTS idx_citas_fecha_hora ON citas(fecha_hora);

-- ============================================================================
-- HISTORIAL_ESTADO_CITA (State History) - Immutable audit trail
-- ============================================================================
CREATE TABLE IF NOT EXISTS historial_estado_cita (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cita_id UUID NOT NULL REFERENCES citas(id) ON DELETE CASCADE,
    estado TEXT NOT NULL CHECK (estado IN ('Solicitada', 'Confirmada', 'Reprogramada', 'Cancelada', 'Atendida', 'NoAsistio')),
    ocurrio_en TIMESTAMPTZ NOT NULL,
    evento_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fetching history by cita
CREATE INDEX IF NOT EXISTS idx_historial_estado_cita_id ON historial_estado_cita(cita_id);
CREATE INDEX IF NOT EXISTS idx_historial_estado_ocurrio_en ON historial_estado_cita(cita_id, ocurrio_en);

-- ============================================================================
-- HISTORIAL_PRIORIDAD_CITA (Priority History) - Immutable audit trail
-- ============================================================================
CREATE TABLE IF NOT EXISTS historial_prioridad_cita (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cita_id UUID NOT NULL REFERENCES citas(id) ON DELETE CASCADE,
    prioridad TEXT NOT NULL CHECK (prioridad IN ('Alta', 'Media', 'Baja')),
    origen TEXT NOT NULL CHECK (origen IN ('Sistema', 'Humano')),
    ocurrio_en TIMESTAMPTZ NOT NULL,
    justificacion TEXT,
    modificado_por TEXT,
    evento_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Human overrides MUST have justification and modifier
    CONSTRAINT chk_human_override CHECK (
        origen = 'Sistema' OR
        (origen = 'Humano' AND justificacion IS NOT NULL AND modificado_por IS NOT NULL)
    )
);

-- Index for fetching history by cita
CREATE INDEX IF NOT EXISTS idx_historial_prioridad_cita_id ON historial_prioridad_cita(cita_id);
CREATE INDEX IF NOT EXISTS idx_historial_prioridad_ocurrio_en ON historial_prioridad_cita(cita_id, ocurrio_en);

-- ============================================================================
-- DOMAIN_EVENTS (Append-Only Event Store) - Source of Truth
-- ============================================================================
CREATE TABLE IF NOT EXISTS domain_events (
    id UUID PRIMARY KEY,
    event_type TEXT NOT NULL CHECK (event_type IN (
        'CitaSolicitada',
        'EstadoCitaCambiado',
        'CitaReprogramada',
        'CitaCancelada',
        'PrioridadCitaAsignadaPorSistema',
        'PrioridadCitaSobrescritaPorHumano'
    )),
    aggregate_id UUID NOT NULL,
    payload JSONB NOT NULL,
    ocurrio_en TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fetching events by aggregate (for event sourcing reconstruction)
CREATE INDEX IF NOT EXISTS idx_domain_events_aggregate ON domain_events(aggregate_id, ocurrio_en);
CREATE INDEX IF NOT EXISTS idx_domain_events_type ON domain_events(event_type);
CREATE INDEX IF NOT EXISTS idx_domain_events_ocurrio_en ON domain_events(ocurrio_en);

-- ============================================================================
-- PENDING_DECISIONS (Decision Engine) - Decisions awaiting human intervention
-- ============================================================================
CREATE TABLE IF NOT EXISTS pending_decisions (
    id UUID PRIMARY KEY,
    decision_context JSONB NOT NULL,
    decision_result JSONB NOT NULL,
    autonomy_level TEXT NOT NULL CHECK (autonomy_level IN ('AUTOMATIC', 'SUPERVISED', 'BLOCKED')),
    razon TEXT NOT NULL,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for querying pending decisions
CREATE INDEX IF NOT EXISTS idx_pending_decisions_autonomy ON pending_decisions(autonomy_level);
CREATE INDEX IF NOT EXISTS idx_pending_decisions_creado_en ON pending_decisions(creado_en);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) - Optional but recommended for production
-- ============================================================================

-- Enable RLS on all tables (uncomment for production)
-- ALTER TABLE citas ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE historial_estado_cita ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE historial_prioridad_cita ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE domain_events ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE pending_decisions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- COMMENTS - Documentation for Supabase Studio
-- ============================================================================
COMMENT ON TABLE citas IS 'Main appointment records. State derived from historial_estado_cita.';
COMMENT ON TABLE historial_estado_cita IS 'Immutable audit trail of state changes. Append-only.';
COMMENT ON TABLE historial_prioridad_cita IS 'Immutable audit trail of priority changes. Human overrides require justification.';
COMMENT ON TABLE domain_events IS 'Append-only event store. Source of truth for event sourcing.';
COMMENT ON TABLE pending_decisions IS 'Decisions requiring human intervention before execution.';

COMMENT ON COLUMN domain_events.aggregate_id IS 'References the cita this event belongs to';
COMMENT ON COLUMN domain_events.payload IS 'Event-specific data serialized as JSON';
COMMENT ON COLUMN historial_prioridad_cita.origen IS 'Sistema = automatic, Humano = manual override';

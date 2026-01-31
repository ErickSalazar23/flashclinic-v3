-- Flash Clinic Schema
-- Compatible with Supabase (PostgreSQL)

-- Pacientes table
CREATE TABLE IF NOT EXISTS pacientes (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  telefono TEXT NOT NULL,
  fecha_nacimiento TIMESTAMPTZ NOT NULL,
  es_recurrente BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Citas table
CREATE TABLE IF NOT EXISTS citas (
  id TEXT PRIMARY KEY,
  paciente_id TEXT NOT NULL REFERENCES pacientes(id),
  especialidad TEXT NOT NULL,
  fecha_hora TIMESTAMPTZ NOT NULL,
  creado_en TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Historial de estados de cita (event sourcing)
CREATE TABLE IF NOT EXISTS historial_estado_cita (
  id SERIAL PRIMARY KEY,
  cita_id TEXT NOT NULL REFERENCES citas(id) ON DELETE CASCADE,
  estado TEXT NOT NULL CHECK (estado IN ('Solicitada', 'Confirmada', 'Reprogramada', 'Cancelada', 'Atendida', 'NoAsistió')),
  ocurrio_en TIMESTAMPTZ NOT NULL,
  evento_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Historial de prioridades de cita (event sourcing)
CREATE TABLE IF NOT EXISTS historial_prioridad_cita (
  id SERIAL PRIMARY KEY,
  cita_id TEXT NOT NULL REFERENCES citas(id) ON DELETE CASCADE,
  prioridad TEXT NOT NULL CHECK (prioridad IN ('Alta', 'Media', 'Baja')),
  origen TEXT NOT NULL CHECK (origen IN ('Sistema', 'Humano')),
  ocurrio_en TIMESTAMPTZ NOT NULL,
  justificacion TEXT,
  modificado_por TEXT,
  evento_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_citas_paciente_id ON citas(paciente_id);
CREATE INDEX IF NOT EXISTS idx_citas_fecha_hora ON citas(fecha_hora);
CREATE INDEX IF NOT EXISTS idx_historial_estado_cita_id ON historial_estado_cita(cita_id);
CREATE INDEX IF NOT EXISTS idx_historial_prioridad_cita_id ON historial_prioridad_cita(cita_id);

-- Pending decisions table (for decision engine)
CREATE TABLE IF NOT EXISTS pending_decisions (
  id TEXT PRIMARY KEY,
  decision_context JSONB NOT NULL,
  decision_result JSONB NOT NULL,
  autonomy_level TEXT NOT NULL CHECK (autonomy_level IN ('AUTOMATIC', 'SUPERVISED', 'BLOCKED')),
  razon TEXT NOT NULL,
  creado_en TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

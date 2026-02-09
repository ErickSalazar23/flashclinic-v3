-- Flash Clinic V3 - Supabase Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PROSPECTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS prospects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Doctor/Clinic Info
  doctor_name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  clinic_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  city TEXT NOT NULL,

  -- Practice Metrics
  citas_semanales INTEGER NOT NULL DEFAULT 0,
  ticket_promedio DECIMAL(10,2) NOT NULL DEFAULT 0,
  no_show_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
  slots_disponibles INTEGER NOT NULL DEFAULT 0,
  horas_consulta INTEGER NOT NULL DEFAULT 0,

  -- Pipeline Stage
  stage TEXT NOT NULL DEFAULT 'agenda_detenida'
    CHECK (stage IN ('agenda_detenida', 'diagnostico_proceso', 'tratamiento_aplicado', 'recuperacion_exitosa')),
  stage_updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Diagnostic Summary (Non-sensitive)
  diagnostic_severity TEXT CHECK (diagnostic_severity IN ('critical', 'severe', 'moderate', 'stable')),
  diagnostic_perdida_anual DECIMAL(12,2),
  
  -- Reference to deep clinical data
  has_detailed_diagnostic BOOLEAN DEFAULT FALSE,

  -- Business Value
  deal_value DECIMAL(12,2) DEFAULT 0,
  ltv DECIMAL(12,2) DEFAULT 0,
  closed_at TIMESTAMPTZ,

  -- Notes
  notes TEXT DEFAULT '',
  next_follow_up TIMESTAMPTZ,

  -- User who owns this prospect (for multi-tenant)
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- =====================================================
-- DECISIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS decisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Decision Info
  type TEXT NOT NULL CHECK (type IN ('prospect_review', 'follow_up', 'deal_approval', 'treatment_plan')),
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'DEFERRED')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),

  title TEXT NOT NULL,
  description TEXT NOT NULL,

  -- Related Prospect
  prospect_id UUID REFERENCES prospects(id) ON DELETE CASCADE,
  prospect_name TEXT,

  -- Dates
  due_date TIMESTAMPTZ,
  decided_at TIMESTAMPTZ,
  decided_by TEXT,

  -- Extra data
  metadata JSONB DEFAULT '{}'::jsonb,

  -- User who owns this decision
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- =====================================================
-- PROSPECT_DIAGNOSTICS TABLE (Sensitive Clinical Data)
-- =====================================================
CREATE TABLE IF NOT EXISTS prospect_diagnostics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  prospect_id UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
  
  -- Clinical Data (Encrypted/Sensitive)
  diagnostic_text TEXT,
  diagnostic_recommendations JSONB DEFAULT '[]'::jsonb,
  clinical_notes TEXT,
  
  -- RAG Metadata
  is_grounded_by_protocol BOOLEAN DEFAULT FALSE,
  protocol_reference TEXT,

  -- User who owns this record
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- =====================================================
-- ACTIVITIES TABLE (for prospect history)
-- =====================================================
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  prospect_id UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('note', 'call', 'email', 'meeting', 'stage_change')),
  description TEXT NOT NULL,
  user_name TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_prospects_stage ON prospects(stage);
CREATE INDEX IF NOT EXISTS idx_prospects_severity ON prospects(diagnostic_severity);
CREATE INDEX IF NOT EXISTS idx_prospects_user ON prospects(user_id);
CREATE INDEX IF NOT EXISTS idx_decisions_status ON decisions(status);
CREATE INDEX IF NOT EXISTS idx_decisions_user ON decisions(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_prospect ON activities(prospect_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Policies for prospects
CREATE POLICY "Users can view their own prospects"
  ON prospects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own prospects"
  ON prospects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prospects"
  ON prospects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own prospects"
  ON prospects FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for decisions
CREATE POLICY "Users can view their own decisions"
  ON decisions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own decisions"
  ON decisions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own decisions"
  ON decisions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own decisions"
  ON decisions FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for activities
CREATE POLICY "Users can view activities of their prospects"
  ON activities FOR SELECT
  USING (
    prospect_id IN (
      SELECT id FROM prospects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert activities to their prospects"
  ON activities FOR INSERT
  WITH CHECK (
    prospect_id IN (
      SELECT id FROM prospects WHERE user_id = auth.uid()
    )
  );

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_prospects_updated_at
  BEFORE UPDATE ON prospects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_decisions_updated_at
  BEFORE UPDATE ON decisions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- PATIENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  
  -- User who owns this record (for multi-tenant)
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- =====================================================
-- APPOINTMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  doctor_id UUID NOT NULL, -- This could reference a doctors table if added later, for now it's just an ID
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  
  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  
  status TEXT NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
  
  notes TEXT,
  
  -- User who owns this record (for multi-tenant)
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- =====================================================
-- INDEXES FOR NEW TABLES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_patients_user ON patients(user_id);
CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(phone);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_user ON appointments(user_id);

-- =====================================================
-- RLS FOR NEW TABLES
-- =====================================================
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Policies for patients
CREATE POLICY "Users can view their own patients"
  ON patients FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own patients"
  ON patients FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own patients"
  ON patients FOR UPDATE
  USING (auth.uid() = user_id);

-- Policies for prospect_diagnostics
ALTER TABLE prospect_diagnostics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own diagnostics"
  ON prospect_diagnostics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own diagnostics"
  ON prospect_diagnostics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own diagnostics"
  ON prospect_diagnostics FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own diagnostics"
  ON prospect_diagnostics FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for appointments
CREATE POLICY "Users can view their own appointments"
  ON appointments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own appointments"
  ON appointments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own appointments"
  ON appointments FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================
-- TRIGGERS FOR NEW TABLES
-- =====================================================
CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON patients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prospect_diagnostics_updated_at
  BEFORE UPDATE ON prospect_diagnostics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- LANDING_LEADS TABLE (for early beta signup)
-- =====================================================
CREATE TABLE IF NOT EXISTS landing_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  clinic_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,

  status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'contacted', 'qualified', 'rejected')),

  notes TEXT DEFAULT '',
  contacted_at TIMESTAMPTZ,

  -- For converting to actual prospect
  prospect_id UUID REFERENCES prospects(id) ON DELETE SET NULL
);

-- Indexes for landing_leads
CREATE INDEX IF NOT EXISTS idx_landing_leads_status ON landing_leads(status);
CREATE INDEX IF NOT EXISTS idx_landing_leads_email ON landing_leads(email);
CREATE INDEX IF NOT EXISTS idx_landing_leads_created ON landing_leads(created_at);

-- RLS for landing_leads
ALTER TABLE landing_leads ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public landing page)
CREATE POLICY "Anyone can insert landing leads"
  ON landing_leads FOR INSERT
  WITH CHECK (true);

-- Only admins can view all leads (public insert, but backend-only select)
CREATE POLICY "Service role can view all landing leads"
  ON landing_leads FOR SELECT
  USING (auth.role() = 'service_role');

-- Trigger for updated_at
CREATE TRIGGER update_landing_leads_updated_at
  BEFORE UPDATE ON landing_leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- APPOINTMENT CHANGES (Audit Log for Status Tracking)
-- =====================================================
CREATE TABLE IF NOT EXISTS appointment_changes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  old_status TEXT NOT NULL,
  new_status TEXT NOT NULL,
  changed_by TEXT DEFAULT 'system',

  -- For attribution: TRUE if system recovered this appointment (pending → confirmed)
  is_system_recovery BOOLEAN DEFAULT FALSE,

  -- User who owns this appointment
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_appointment_changes_appointment ON appointment_changes(appointment_id);
CREATE INDEX IF NOT EXISTS idx_appointment_changes_user ON appointment_changes(user_id);
CREATE INDEX IF NOT EXISTS idx_appointment_changes_created ON appointment_changes(created_at);
CREATE INDEX IF NOT EXISTS idx_appointment_changes_recovery ON appointment_changes(is_system_recovery);

-- RLS
ALTER TABLE appointment_changes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view changes for their appointments"
  ON appointment_changes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert changes"
  ON appointment_changes FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- AUTO-LOG APPOINTMENT STATUS CHANGES (PostgreSQL Trigger)
-- =====================================================
CREATE OR REPLACE FUNCTION log_appointment_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO appointment_changes (
      appointment_id,
      old_status,
      new_status,
      user_id,
      is_system_recovery
    ) VALUES (
      NEW.id,
      OLD.status,
      NEW.status,
      NEW.user_id,
      -- Mark as recovery if: pending → confirmed
      (OLD.status = 'pending' AND NEW.status = 'confirmed')
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_appointment_status_changes
  AFTER UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION log_appointment_status_change();

-- ============================================
-- FlashClinic V3 - Database Schema
-- Phase 1.5: Database & Contracts
-- ============================================

-- ============================================
-- ENUM TYPES
-- ============================================

CREATE TYPE appointment_status AS ENUM (
  'CONFIRMED',
  'CANCELLED',
  'COMPLETED'
);

CREATE TYPE appointment_priority AS ENUM (
  'LOW',
  'MEDIUM',
  'HIGH'
);

CREATE TYPE decision_weight AS ENUM (
  'LOW',
  'MEDIUM',
  'HIGH'
);

-- ============================================
-- TABLES
-- ============================================

-- 1️⃣ Patients
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL CHECK (char_length(full_name) >= 2),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE patients IS 'Patient records for FlashClinic';

-- 2️⃣ Appointments
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  status appointment_status NOT NULL DEFAULT 'CONFIRMED',
  priority appointment_priority NOT NULL DEFAULT 'LOW',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE appointments IS 'Appointment records with status state machine';

-- 3️⃣ Pending Decisions
CREATE TABLE pending_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_type TEXT NOT NULL DEFAULT 'APPOINTMENT',
  reference_id UUID NOT NULL,
  weight decision_weight NOT NULL DEFAULT 'LOW',
  reason TEXT NOT NULL,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT valid_reference_type CHECK (reference_type IN ('APPOINTMENT'))
);

COMMENT ON TABLE pending_decisions IS 'Decisions awaiting human approval (SUPERVISED/BLOCKED)';

-- 4️⃣ Domain Events
CREATE TABLE domain_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aggregate_type TEXT NOT NULL,
  aggregate_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE domain_events IS 'Event sourcing audit trail - append only';

-- ============================================
-- INDEXES
-- ============================================

-- Patients
CREATE INDEX idx_patients_email ON patients(email);

-- Appointments
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_created ON appointments(created_at DESC);

-- Pending Decisions
CREATE INDEX idx_pending_decisions_reference ON pending_decisions(reference_type, reference_id);
CREATE INDEX idx_pending_decisions_unresolved ON pending_decisions(id) WHERE resolved_at IS NULL;

-- Domain Events
CREATE INDEX idx_domain_events_aggregate ON domain_events(aggregate_type, aggregate_id);
CREATE INDEX idx_domain_events_type ON domain_events(event_type);
CREATE INDEX idx_domain_events_created ON domain_events(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE domain_events ENABLE ROW LEVEL SECURITY;

-- Patients: Users can read their own record (matched by email)
CREATE POLICY "patients_select_own" ON patients
  FOR SELECT
  USING (auth.jwt() ->> 'email' = email);

-- Patients: Authenticated users can insert (for registration)
CREATE POLICY "patients_insert_authenticated" ON patients
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Appointments: Patients can read their own appointments
CREATE POLICY "appointments_select_own" ON appointments
  FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM patients WHERE auth.jwt() ->> 'email' = email
    )
  );

-- Appointments: Authenticated users can create appointments
CREATE POLICY "appointments_insert_authenticated" ON appointments
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Appointments: Patients can update their own appointments (cancel)
CREATE POLICY "appointments_update_own" ON appointments
  FOR UPDATE
  USING (
    patient_id IN (
      SELECT id FROM patients WHERE auth.jwt() ->> 'email' = email
    )
  );

-- Pending Decisions: Only service role can manage (internal system)
CREATE POLICY "pending_decisions_service_only" ON pending_decisions
  FOR ALL
  USING (auth.role() = 'service_role');

-- Domain Events: Read-only for authenticated, append via service role
CREATE POLICY "domain_events_select_authenticated" ON domain_events
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "domain_events_insert_service" ON domain_events
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- ============================================
-- FUNCTIONS (for future triggers)
-- ============================================

-- Function to auto-publish domain event on appointment status change
CREATE OR REPLACE FUNCTION fn_appointment_status_changed()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO domain_events (aggregate_type, aggregate_id, event_type, payload)
    VALUES (
      'APPOINTMENT',
      NEW.id,
      'APPOINTMENT_STATUS_CHANGED',
      jsonb_build_object(
        'previous_status', OLD.status,
        'new_status', NEW.status,
        'patient_id', NEW.patient_id
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for appointment status changes
CREATE TRIGGER trg_appointment_status_changed
  AFTER UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION fn_appointment_status_changed();

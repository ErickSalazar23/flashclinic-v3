-- ============================================
-- FlashClinic V3 - Appointment Fields Migration
-- Phase 4: Appointments Feature
-- ============================================

-- Add new required fields to appointments table
ALTER TABLE appointments
  ADD COLUMN scheduled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD COLUMN reason TEXT NOT NULL DEFAULT '',
  ADD COLUMN specialty TEXT NOT NULL DEFAULT 'General Medicine',
  ADD COLUMN notes TEXT,
  ADD COLUMN updated_at TIMESTAMPTZ;

-- Remove defaults after adding columns (they were only for existing rows)
ALTER TABLE appointments
  ALTER COLUMN scheduled_at DROP DEFAULT,
  ALTER COLUMN reason DROP DEFAULT,
  ALTER COLUMN specialty DROP DEFAULT;

-- Add constraint for reason minimum length
ALTER TABLE appointments
  ADD CONSTRAINT check_reason_not_empty CHECK (char_length(reason) >= 1);

-- Add constraint for specialty minimum length
ALTER TABLE appointments
  ADD CONSTRAINT check_specialty_not_empty CHECK (char_length(specialty) >= 1);

-- Add index for scheduled_at (common query pattern)
CREATE INDEX idx_appointments_scheduled ON appointments(scheduled_at DESC);

-- Add index for specialty (filtering)
CREATE INDEX idx_appointments_specialty ON appointments(specialty);

-- ============================================
-- TRIGGER: Auto-update updated_at
-- ============================================

CREATE OR REPLACE FUNCTION fn_appointments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION fn_appointments_updated_at();

-- ============================================
-- UPDATE DOMAIN EVENT TRIGGER
-- ============================================

-- Update the status change trigger to include new fields in payload
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
        'patient_id', NEW.patient_id,
        'scheduled_at', NEW.scheduled_at,
        'specialty', NEW.specialty,
        'priority', NEW.priority
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON COLUMN appointments.scheduled_at IS 'Date and time when the appointment is scheduled';
COMMENT ON COLUMN appointments.reason IS 'Patient-provided reason for the appointment';
COMMENT ON COLUMN appointments.specialty IS 'Medical specialty for the appointment';
COMMENT ON COLUMN appointments.notes IS 'Additional notes (optional)';
COMMENT ON COLUMN appointments.updated_at IS 'Last update timestamp (auto-set by trigger)';

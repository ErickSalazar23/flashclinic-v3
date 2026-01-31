-- ============================================
-- FlashClinic V3 - Priority Override System
-- Phase 8: Human-in-the-Loop Priority Override
-- ============================================

-- ============================================
-- 1. Add priority_history JSONB column
-- ============================================

-- Priority origin type for tracking system vs human changes
CREATE TYPE priority_origin AS ENUM ('SYSTEM', 'HUMAN');

-- Add priority_history column to appointments
ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS priority_history JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN appointments.priority_history IS 'Audit trail of priority changes. Each entry: {priority, origin, occurred_at, changed_by, justification}';

-- ============================================
-- 2. Create trigger for priority history
-- ============================================

-- Function to auto-record priority changes
CREATE OR REPLACE FUNCTION fn_appointment_priority_history()
RETURNS TRIGGER AS $$
BEGIN
  -- Only record if priority actually changed
  IF OLD.priority IS DISTINCT FROM NEW.priority THEN
    -- Append new entry to priority_history
    NEW.priority_history := COALESCE(OLD.priority_history, '[]'::jsonb) || jsonb_build_object(
      'priority', NEW.priority,
      'previous_priority', OLD.priority,
      'origin', 'SYSTEM',  -- Default, can be overridden by application
      'occurred_at', now()::text,
      'changed_by', NULL,
      'justification', NULL
    );

    -- Publish domain event for priority change
    INSERT INTO domain_events (aggregate_type, aggregate_id, event_type, payload)
    VALUES (
      'APPOINTMENT',
      NEW.id,
      'APPOINTMENT_PRIORITY_CHANGED',
      jsonb_build_object(
        'previous_priority', OLD.priority,
        'new_priority', NEW.priority,
        'patient_id', NEW.patient_id
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger (after existing triggers)
DROP TRIGGER IF EXISTS trg_appointment_priority_history ON appointments;
CREATE TRIGGER trg_appointment_priority_history
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION fn_appointment_priority_history();

-- ============================================
-- 3. Helper function for priority override
-- ============================================

-- Function to override priority with full audit trail
-- Called from application when human overrides priority
CREATE OR REPLACE FUNCTION fn_override_appointment_priority(
  p_appointment_id UUID,
  p_new_priority appointment_priority,
  p_changed_by UUID,
  p_justification TEXT
)
RETURNS appointments AS $$
DECLARE
  v_appointment appointments;
  v_old_priority appointment_priority;
BEGIN
  -- Get current appointment
  SELECT * INTO v_appointment
  FROM appointments
  WHERE id = p_appointment_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Appointment not found: %', p_appointment_id;
  END IF;

  -- Store old priority
  v_old_priority := v_appointment.priority;

  -- Skip if no change
  IF v_old_priority = p_new_priority THEN
    RETURN v_appointment;
  END IF;

  -- Update priority and append to history with human origin
  UPDATE appointments
  SET
    priority = p_new_priority,
    priority_history = COALESCE(priority_history, '[]'::jsonb) || jsonb_build_object(
      'priority', p_new_priority,
      'previous_priority', v_old_priority,
      'origin', 'HUMAN',
      'occurred_at', now()::text,
      'changed_by', p_changed_by,
      'justification', p_justification
    ),
    updated_at = now()
  WHERE id = p_appointment_id
  RETURNING * INTO v_appointment;

  -- Publish domain event with human override details
  INSERT INTO domain_events (aggregate_type, aggregate_id, event_type, payload)
  VALUES (
    'APPOINTMENT',
    p_appointment_id,
    'APPOINTMENT_PRIORITY_CHANGED',
    jsonb_build_object(
      'previous_priority', v_old_priority,
      'new_priority', p_new_priority,
      'changed_by', p_changed_by,
      'justification', p_justification,
      'origin', 'HUMAN',
      'patient_id', v_appointment.patient_id
    )
  );

  RETURN v_appointment;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 4. Indexes for priority history queries
-- ============================================

-- GIN index for querying priority history
CREATE INDEX IF NOT EXISTS idx_appointments_priority_history
ON appointments USING GIN (priority_history);

-- ============================================
-- 5. Initialize priority_history for existing appointments
-- ============================================

-- Set initial history for appointments without history
UPDATE appointments
SET priority_history = jsonb_build_array(
  jsonb_build_object(
    'priority', priority,
    'previous_priority', NULL,
    'origin', 'SYSTEM',
    'occurred_at', created_at::text,
    'changed_by', NULL,
    'justification', 'Initial priority set by system'
  )
)
WHERE priority_history IS NULL OR priority_history = '[]'::jsonb;

-- ============================================
-- 6. View for priority change analytics
-- ============================================

CREATE OR REPLACE VIEW v_priority_overrides AS
SELECT
  a.id AS appointment_id,
  a.patient_id,
  a.priority AS current_priority,
  (h.value->>'previous_priority') AS previous_priority,
  (h.value->>'priority') AS new_priority,
  (h.value->>'origin') AS origin,
  (h.value->>'occurred_at')::timestamptz AS occurred_at,
  (h.value->>'changed_by')::uuid AS changed_by,
  (h.value->>'justification') AS justification
FROM appointments a
CROSS JOIN LATERAL jsonb_array_elements(a.priority_history) AS h(value)
WHERE h.value->>'origin' = 'HUMAN'
ORDER BY (h.value->>'occurred_at')::timestamptz DESC;

COMMENT ON VIEW v_priority_overrides IS 'Human priority overrides for audit and analytics';

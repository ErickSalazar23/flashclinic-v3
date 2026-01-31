-- ============================================
-- FlashClinic V3 - Appointment State Machine Migration
-- Phase 5: Full State Machine Implementation
-- ============================================

-- ============================================
-- 1. ADD NEW STATUS VALUES TO ENUM
-- ============================================

-- PostgreSQL doesn't allow easy enum modification, so we need to:
-- 1. Create a new enum type
-- 2. Update the column to use text temporarily
-- 3. Drop the old enum
-- 4. Create the new enum with all values
-- 5. Convert the column back to enum

-- Step 1: Add new values to the enum using ALTER TYPE
-- Note: This only works for adding new values, not removing

ALTER TYPE appointment_status ADD VALUE IF NOT EXISTS 'REQUESTED';
ALTER TYPE appointment_status ADD VALUE IF NOT EXISTS 'RESCHEDULED';
ALTER TYPE appointment_status ADD VALUE IF NOT EXISTS 'ATTENDED';
ALTER TYPE appointment_status ADD VALUE IF NOT EXISTS 'NO_SHOW';

-- Remove COMPLETED if it exists (it's replaced by ATTENDED)
-- Note: PostgreSQL doesn't support removing enum values directly
-- We'll handle this at the application level - COMPLETED will just not be used

-- ============================================
-- 2. ADD STATUS HISTORY COLUMN
-- ============================================

-- Add status_history JSONB column to track all status changes
ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS status_history JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN appointments.status_history IS 'Audit trail of all status changes with timestamps and reasons';

-- ============================================
-- 3. CREATE TRIGGER FOR AUTO-RECORDING HISTORY
-- ============================================

-- Function to auto-append to status_history on status change
CREATE OR REPLACE FUNCTION fn_appointment_status_history()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Append new entry to status_history
    NEW.status_history = COALESCE(NEW.status_history, '[]'::jsonb) || jsonb_build_object(
      'status', NEW.status,
      'occurred_at', now(),
      'previous_status', OLD.status
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists, then create
DROP TRIGGER IF EXISTS trg_appointment_status_history ON appointments;

CREATE TRIGGER trg_appointment_status_history
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION fn_appointment_status_history();

-- ============================================
-- 4. UPDATE EXISTING STATUS CHANGE EVENT TRIGGER
-- ============================================

-- Enhanced status change event with history reference
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
        'priority', NEW.priority,
        'history_length', jsonb_array_length(COALESCE(NEW.status_history, '[]'::jsonb))
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 5. ADD INDEX FOR STATUS HISTORY QUERIES
-- ============================================

-- Index for finding appointments by specific status in history
CREATE INDEX IF NOT EXISTS idx_appointments_status_history
  ON appointments USING GIN (status_history);

-- ============================================
-- 6. INITIALIZE STATUS HISTORY FOR EXISTING APPOINTMENTS
-- ============================================

-- Set initial history for existing appointments that don't have history yet
UPDATE appointments
SET status_history = jsonb_build_array(
  jsonb_build_object(
    'status', status,
    'occurred_at', created_at,
    'reason', 'Initial status (migration)'
  )
)
WHERE status_history = '[]'::jsonb OR status_history IS NULL;

-- ============================================
-- 7. ADD HELPER FUNCTIONS FOR HISTORY QUERIES
-- ============================================

-- Function to get time in current status (in hours)
CREATE OR REPLACE FUNCTION fn_appointment_time_in_status(app_row appointments)
RETURNS INTERVAL AS $$
DECLARE
  last_entry jsonb;
  occurred_at timestamptz;
BEGIN
  -- Get the last entry in status_history
  last_entry := app_row.status_history->-1;

  IF last_entry IS NULL THEN
    RETURN now() - app_row.created_at;
  END IF;

  occurred_at := (last_entry->>'occurred_at')::timestamptz;
  RETURN now() - occurred_at;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to count status transitions
CREATE OR REPLACE FUNCTION fn_appointment_transition_count(app_row appointments)
RETURNS INTEGER AS $$
BEGIN
  RETURN jsonb_array_length(COALESCE(app_row.status_history, '[]'::jsonb));
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION fn_appointment_time_in_status IS 'Returns time spent in current status';
COMMENT ON FUNCTION fn_appointment_transition_count IS 'Returns total number of status transitions';

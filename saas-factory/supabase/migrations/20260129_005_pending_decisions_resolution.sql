-- ============================================
-- FlashClinic V3 - Pending Decisions Resolution Migration
-- Phase 6: Idempotency + Approval Flow
-- ============================================

-- ============================================
-- 1. ADD RESOLUTION TYPE ENUM
-- ============================================

CREATE TYPE resolution_type AS ENUM ('APPROVED', 'REJECTED');

-- ============================================
-- 2. ADD NEW COLUMNS FOR RESOLUTION TRACKING
-- ============================================

-- Resolution type (APPROVED or REJECTED)
ALTER TABLE pending_decisions
  ADD COLUMN IF NOT EXISTS resolution_type resolution_type;

-- Notes from the resolver (optional justification)
ALTER TABLE pending_decisions
  ADD COLUMN IF NOT EXISTS resolution_notes TEXT;

-- Appointment data to create upon approval (stored as JSONB)
ALTER TABLE pending_decisions
  ADD COLUMN IF NOT EXISTS appointment_data JSONB;

-- Created appointment ID (after approval)
ALTER TABLE pending_decisions
  ADD COLUMN IF NOT EXISTS created_appointment_id UUID REFERENCES appointments(id);

-- Autonomy level that triggered this decision
ALTER TABLE pending_decisions
  ADD COLUMN IF NOT EXISTS autonomy_level TEXT CHECK (autonomy_level IN ('SUPERVISED', 'BLOCKED'));

COMMENT ON COLUMN pending_decisions.resolution_type IS 'How the decision was resolved: APPROVED or REJECTED';
COMMENT ON COLUMN pending_decisions.resolution_notes IS 'Optional notes from the resolver explaining their decision';
COMMENT ON COLUMN pending_decisions.appointment_data IS 'JSONB containing appointment data to create upon approval';
COMMENT ON COLUMN pending_decisions.created_appointment_id IS 'ID of the appointment created after approval (if applicable)';
COMMENT ON COLUMN pending_decisions.autonomy_level IS 'Autonomy level that triggered this pending decision';

-- ============================================
-- 3. ADD INDEXES FOR COMMON QUERIES
-- ============================================

-- Index for finding unresolved decisions by type
CREATE INDEX IF NOT EXISTS idx_pending_decisions_unresolved_type
  ON pending_decisions(reference_type)
  WHERE resolved_at IS NULL;

-- Index for finding decisions by resolution type
CREATE INDEX IF NOT EXISTS idx_pending_decisions_resolution
  ON pending_decisions(resolution_type)
  WHERE resolution_type IS NOT NULL;

-- Index for finding decisions by weight (for prioritization)
CREATE INDEX IF NOT EXISTS idx_pending_decisions_weight
  ON pending_decisions(weight)
  WHERE resolved_at IS NULL;

-- ============================================
-- 4. CREATE FUNCTION FOR IDEMPOTENT APPROVAL
-- ============================================

-- Function to check if a decision is already resolved
-- Returns: 'PENDING', 'APPROVED', 'REJECTED'
CREATE OR REPLACE FUNCTION fn_get_decision_status(decision_id UUID)
RETURNS TEXT AS $$
DECLARE
  decision_record pending_decisions%ROWTYPE;
BEGIN
  SELECT * INTO decision_record
  FROM pending_decisions
  WHERE id = decision_id;

  IF NOT FOUND THEN
    RETURN 'NOT_FOUND';
  END IF;

  IF decision_record.resolved_at IS NULL THEN
    RETURN 'PENDING';
  END IF;

  RETURN decision_record.resolution_type::TEXT;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION fn_get_decision_status IS 'Returns the current status of a pending decision';

-- ============================================
-- 5. CREATE TRIGGER FOR DOMAIN EVENTS
-- ============================================

-- Function to emit domain event when decision is resolved
CREATE OR REPLACE FUNCTION fn_decision_resolved()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger when resolved_at changes from NULL to a value
  IF OLD.resolved_at IS NULL AND NEW.resolved_at IS NOT NULL THEN
    INSERT INTO domain_events (aggregate_type, aggregate_id, event_type, payload)
    VALUES (
      'PENDING_DECISION',
      NEW.id,
      'DECISION_RESOLVED',
      jsonb_build_object(
        'reference_type', NEW.reference_type,
        'reference_id', NEW.reference_id,
        'resolution_type', NEW.resolution_type,
        'resolved_by', NEW.resolved_by,
        'weight', NEW.weight,
        'created_appointment_id', NEW.created_appointment_id
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS trg_decision_resolved ON pending_decisions;

CREATE TRIGGER trg_decision_resolved
  AFTER UPDATE ON pending_decisions
  FOR EACH ROW
  EXECUTE FUNCTION fn_decision_resolved();

-- ============================================
-- 6. ADD RLS POLICIES FOR RESOLUTION
-- ============================================

-- Policy for staff to view all pending decisions
DROP POLICY IF EXISTS "Staff can view pending decisions" ON pending_decisions;
CREATE POLICY "staff_can_view_pending_decisions" ON pending_decisions
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Policy for admins to resolve decisions (update)
DROP POLICY IF EXISTS "Admins can resolve decisions" ON pending_decisions;
CREATE POLICY "authenticated_can_resolve_decisions" ON pending_decisions
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Note: In production, you would want more granular role checking
-- This can be enhanced with a profiles table and role column

-- ============================================
-- 7. CREATE VIEW FOR DECISION DASHBOARD
-- ============================================

CREATE OR REPLACE VIEW v_pending_decisions_summary AS
SELECT
  pd.id,
  pd.reference_type,
  pd.reference_id,
  pd.weight,
  pd.autonomy_level,
  pd.reason,
  pd.created_at,
  pd.resolved_at,
  pd.resolution_type,
  pd.resolution_notes,
  pd.created_appointment_id,
  CASE
    WHEN pd.resolved_at IS NULL THEN 'PENDING'
    ELSE pd.resolution_type::TEXT
  END AS status,
  EXTRACT(EPOCH FROM (COALESCE(pd.resolved_at, now()) - pd.created_at)) / 3600 AS hours_since_created,
  p.full_name AS patient_name,
  p.email AS patient_email
FROM pending_decisions pd
LEFT JOIN patients p ON (pd.appointment_data->>'patient_id')::UUID = p.id;

COMMENT ON VIEW v_pending_decisions_summary IS 'Summary view for decision dashboard with patient info';

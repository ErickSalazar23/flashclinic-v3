import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get service role client for admin operations
    const { data, error: adminError } = await request.json().catch(() => ({ data: null }))

    const sql = `
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
    `

    // Use Supabase admin client to execute raw SQL
    const { data: result, error } = await supabase.rpc('exec_raw_sql', { sql })

    if (error) {
      // If RPC doesn't exist, try direct query
      console.log('⚠️ RPC not available, attempting direct execution')
      return NextResponse.json({
        ok: false,
        message: 'Manual execution required. Please run the SQL in Supabase SQL Editor at: https://app.supabase.com/project/yrlxpabmxezbcftxqivs/sql/new',
        sql
      }, { status: 400 })
    }

    return NextResponse.json({
      ok: true,
      message: '✅ appointment_changes table created successfully with trigger active',
      result
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

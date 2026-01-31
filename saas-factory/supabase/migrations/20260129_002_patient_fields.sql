-- ============================================
-- FlashClinic V3 - Patient Fields Update
-- Phase 3: Patient Feature
-- ============================================

-- Add new columns to patients table
ALTER TABLE patients
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS birth_date DATE,
  ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

-- Add constraints
ALTER TABLE patients
  ADD CONSTRAINT patients_phone_length CHECK (phone IS NULL OR char_length(phone) >= 8),
  ADD CONSTRAINT patients_birth_date_not_future CHECK (birth_date IS NULL OR birth_date <= CURRENT_DATE),
  ADD CONSTRAINT patients_birth_date_not_ancient CHECK (birth_date IS NULL OR birth_date > CURRENT_DATE - INTERVAL '150 years');

-- Create index for phone lookups
CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(phone);

-- Create index for recurring patient queries
CREATE INDEX IF NOT EXISTS idx_patients_is_recurring ON patients(is_recurring) WHERE is_recurring = true;

-- Create index for birth date (for age-based queries)
CREATE INDEX IF NOT EXISTS idx_patients_birth_date ON patients(birth_date);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION fn_update_patient_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_patients_updated_at ON patients;
CREATE TRIGGER trg_patients_updated_at
  BEFORE UPDATE ON patients
  FOR EACH ROW
  EXECUTE FUNCTION fn_update_patient_timestamp();

-- Update RLS policy to allow updates
DROP POLICY IF EXISTS "patients_update_own" ON patients;
CREATE POLICY "patients_update_own" ON patients
  FOR UPDATE
  USING (auth.jwt() ->> 'email' = email);

-- Comment on new columns
COMMENT ON COLUMN patients.phone IS 'Patient phone number (minimum 8 digits)';
COMMENT ON COLUMN patients.birth_date IS 'Patient birth date for age calculations';
COMMENT ON COLUMN patients.is_recurring IS 'Flag for patients with 3+ appointments';
COMMENT ON COLUMN patients.updated_at IS 'Last update timestamp';

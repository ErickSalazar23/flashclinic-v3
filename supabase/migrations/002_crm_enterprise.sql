-- Enterprise CRM Flash Clinic - Evolution to Live System
-- Migration: Add CRM tables

-- 1. Create crm_users table (extends auth.users)
CREATE TABLE IF NOT EXISTS crm_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'sales' CHECK (role IN ('admin', 'sales', 'viewer')),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- 2. Create crm_prospects table
CREATE TABLE IF NOT EXISTS crm_prospects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Doctor/Clinic Info
  doctor_name TEXT NOT NULL,
  clinic_name TEXT,
  specialty TEXT,
  email TEXT,
  phone TEXT,
  
  -- Operational Metrics
  citas_semanales INTEGER NOT NULL,
  ticket_promedio NUMERIC(15,2) NOT NULL,
  no_show_percentage NUMERIC(5,2) NOT NULL,
  slots_disponibles INTEGER NOT NULL,
  
  -- Pipeline Stage
  stage TEXT NOT NULL DEFAULT 'agenda_detenida' 
    CHECK (stage IN ('agenda_detenida', 'diagnostico_proceso', 'tratamiento_activo', 'recuperacion_exitosa')),
  
  -- Deal/LTV Info
  deal_value NUMERIC(15,2),
  ltv NUMERIC(15,2),
  closed_at TIMESTAMPTZ
);

-- 3. Create crm_diagnostics table
CREATE TABLE IF NOT EXISTS crm_diagnostics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id UUID NOT NULL REFERENCES crm_prospects(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Financial results
  perdida_anual NUMERIC(15,2) NOT NULL,
  perdida_no_show NUMERIC(15,2) NOT NULL,
  costo_oportunidad NUMERIC(15,2) NOT NULL,
  silla_vacia_percentage NUMERIC(5,2) NOT NULL,
  rentabilidad_percentage NUMERIC(5,2) NOT NULL,
  
  -- Classification
  severity_score NUMERIC(5,2) NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'severe', 'moderate', 'stable')),
  
  -- Generated Language
  diagnostic_text TEXT NOT NULL,
  headline TEXT NOT NULL,
  recommendations JSONB NOT NULL
);

-- 4. Create crm_activities table (Timeline)
CREATE TABLE IF NOT EXISTS crm_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id UUID NOT NULL REFERENCES crm_prospects(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'stage_change', 'note_added', 'email_sent', 'call_made', 
    'meeting_scheduled', 'diagnostic_run', 'deal_closed'
  )),
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB
);

-- 5. Create crm_analytics_cache table
CREATE TABLE IF NOT EXISTS crm_analytics_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  total_prospects INTEGER NOT NULL,
  total_critical INTEGER NOT NULL,
  total_perdida_anual NUMERIC(15,2) NOT NULL,
  conversion_rate NUMERIC(5,2) NOT NULL,
  total_ltv NUMERIC(15,2) NOT NULL,
  stage_stats JSONB NOT NULL,
  severity_stats JSONB NOT NULL,
  is_current BOOLEAN NOT NULL DEFAULT true
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_crm_prospects_stage ON crm_prospects(stage);
CREATE INDEX IF NOT EXISTS idx_crm_diagnostics_prospect_id ON crm_diagnostics(prospect_id);
CREATE INDEX IF NOT EXISTS idx_crm_activities_prospect_id ON crm_activities(prospect_id);

-- Enable RLS
ALTER TABLE crm_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_diagnostics ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_analytics_cache ENABLE ROW LEVEL SECURITY;

-- Simple Policies (Full access for authenticated users for now)
-- You should refine these in production
CREATE POLICY "Allow authenticated full access to crm_users" ON crm_users FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated full access to crm_prospects" ON crm_prospects FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated full access to crm_diagnostics" ON crm_diagnostics FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated full access to crm_activities" ON crm_activities FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated full access to crm_analytics_cache" ON crm_analytics_cache FOR ALL TO authenticated USING (true);

-- Landing Page Leads Table (no RLS - public inserts allowed)
CREATE TABLE IF NOT EXISTS landing_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  clinic_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,

  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'converted', 'rejected')),
  notes TEXT DEFAULT ''
);

-- Index for searching
CREATE INDEX IF NOT EXISTS idx_landing_leads_email ON landing_leads(email);
CREATE INDEX IF NOT EXISTS idx_landing_leads_created ON landing_leads(created_at DESC);

-- NO RLS on this table - it's for public leads

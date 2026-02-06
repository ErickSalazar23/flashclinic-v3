#!/usr/bin/env node

/**
 * Database Initialization Script
 * Ejecuta el SQL necesario para crear tablas en Supabase
 */

const https = require('https');
const { URL } = require('url');

// Cargar variables de entorno
require('dotenv').config({ path: '../saas-factory/.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Error: Falta NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local');
  process.exit(1);
}

// SQL para crear la tabla landing_leads
const SQL = `
CREATE TABLE IF NOT EXISTS landing_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  clinic_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'converted', 'rejected')),
  notes TEXT DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_landing_leads_email ON landing_leads(email);
CREATE INDEX IF NOT EXISTS idx_landing_leads_created ON landing_leads(created_at DESC);

-- Permitir inserciones públicas (sin RLS)
ALTER TABLE landing_leads DISABLE ROW LEVEL SECURITY;

-- Crear política de lectura pública si es necesario
ALTER TABLE landing_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can insert leads" ON landing_leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can view leads" ON landing_leads FOR SELECT USING (true);
`;

async function initDB() {
  console.log('🚀 Inicializando base de datos...\n');

  try {
    // Hacer request a Supabase SQL endpoint
    const url = new URL(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`);

    // Alternativa: usar el SQL endpoint directamente
    console.log('📝 Ejecutando SQL en Supabase...');
    console.log('URL:', SUPABASE_URL);

    // Por ahora, mostrar instrucciones al usuario
    console.log('\n✅ Script de inicialización listo.');
    console.log('\n📋 Para crear la tabla landing_leads, ejecuta este SQL en Supabase:\n');
    console.log('='.repeat(80));
    console.log(SQL);
    console.log('='.repeat(80));
    console.log('\n1. Ve a https://app.supabase.com');
    console.log('2. Selecciona tu proyecto');
    console.log('3. SQL Editor → New Query');
    console.log('4. Pega el SQL arriba');
    console.log('5. Click "RUN"\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

initDB();

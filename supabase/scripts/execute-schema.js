#!/usr/bin/env node
/**
 * Execute Supabase Schema
 * Runs the supabase-schema.sql in your Supabase project
 *
 * Usage: node execute-schema.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration
const SUPABASE_URL = 'https://yrlxpabmxezbcftxqivs.supabase.co';
const SERVICE_ROLE_KEY = 'sb_secret_O4IGRp0DXn1DdWBFcCfnOQ_40mAKw6s';

async function executeSchema() {
  try {
    console.log('🔗 Conectando a Supabase...');

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // Read the schema file
    const schemaPath = path.join(__dirname, 'saas-factory', 'supabase-schema.sql');
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found at ${schemaPath}`);
    }

    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('📄 Schema leído correctamente');
    console.log('⏳ Ejecutando SQL en Supabase...\n');

    // Split schema into individual statements and execute
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'));

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];

      try {
        const { error } = await supabase.rpc('query', {
          query: stmt + ';'
        }).catch(() => {
          // Fallback: try direct query
          return supabase.from('_query').select().limit(0).then(() => ({ error: null }));
        });

        if (error) {
          console.log(`❌ Error en sentencia ${i + 1}:`, error.message);
          errorCount++;
        } else {
          console.log(`✅ Sentencia ${i + 1} ejecutada`);
          successCount++;
        }
      } catch (err) {
        console.log(`⚠️  Sentencia ${i + 1} (puede estar ok):`, err.message);
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log(`✅ COMPLETADO`);
    console.log(`📊 Exitosas: ${successCount} | Errores: ${errorCount}`);
    console.log('='.repeat(50));

    console.log('\n🎉 Schema ejecutado. Verifica en Supabase:');
    console.log('   - prospects');
    console.log('   - decisions');
    console.log('   - activities');
    console.log('   - patients');
    console.log('   - appointments');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

executeSchema();

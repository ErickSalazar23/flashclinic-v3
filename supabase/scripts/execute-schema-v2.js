#!/usr/bin/env node
/**
 * Execute Supabase Schema via REST API
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const SUPABASE_URL = 'https://yrlxpabmxezbcftxqivs.supabase.co';
const SERVICE_ROLE_KEY = 'sb_secret_O4IGRp0DXn1DdWBFcCfnOQ_40mAKw6s';

async function executeSQL(sql) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'yrlxpabmxezbcftxqivs.supabase.co',
      port: 443,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(JSON.stringify({ query: sql }))
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 204) {
          resolve({ success: true, status: res.statusCode });
        } else {
          reject(new Error(`Status ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(JSON.stringify({ query: sql }));
    req.end();
  });
}

async function main() {
  try {
    console.log('🔗 Conectando a Supabase...');

    const schemaPath = path.join(__dirname, 'saas-factory', 'supabase-schema.sql');
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found at ${schemaPath}`);
    }

    const schema = fs.readFileSync(schemaPath, 'utf8');
    console.log('📄 Schema leído correctamente');

    console.log('\n⏳ Ejecutando SQL en Supabase...\n');

    try {
      await executeSQL(schema);
      console.log('✅ Schema ejecutado exitosamente en Supabase');
    } catch (err) {
      console.log('ℹ️  API RPC no disponible. Por favor ejecuta el SQL manualmente:');
      console.log('\n1. Ve a: https://app.supabase.com');
      console.log('2. SQL Editor → New Query');
      console.log('3. Copia todo el contenido de saas-factory/supabase-schema.sql');
      console.log('4. Pega en el editor y haz click en RUN\n');
      console.log('Alternativa rápida: copia este enlace:');
      console.log('https://app.supabase.com/project/yrlxpabmxezbcftxqivs/sql/new');
      return;
    }

    console.log('\n✅ COMPLETADO');
    console.log('\n🎉 Tablas creadas:');
    console.log('   ✓ prospects');
    console.log('   ✓ decisions');
    console.log('   ✓ activities');
    console.log('   ✓ patients');
    console.log('   ✓ appointments');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();

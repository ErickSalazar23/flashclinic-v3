import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * API Route to initialize landing_leads table
 * GET /api/init/landing-leads
 */
export async function GET() {
  try {
    const supabase = createClient()

    // Intentar crear la tabla
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS landing_leads (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          created_at TIMESTAMPTZ DEFAULT NOW(),
          clinic_name TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT NOT NULL,
          status TEXT DEFAULT 'new',
          notes TEXT DEFAULT ''
        );

        CREATE INDEX IF NOT EXISTS idx_landing_leads_email ON landing_leads(email);
        CREATE INDEX IF NOT EXISTS idx_landing_leads_created ON landing_leads(created_at DESC);
      `
    }).catch(err => ({ error: err }))

    // Si el RPC no funciona, intentar una estrategia alternativa
    // (Supabase no tiene RPC para SQL directo desde anon key)
    // Por eso vamos a hacer una inserción de prueba

    const { error: testError } = await supabase
      .from('landing_leads')
      .insert({
        clinic_name: 'Test',
        email: 'test@test.com',
        phone: '+1234567890',
        status: 'new'
      })
      .select()

    // Si la tabla no existe, el insert fallará con "relation does not exist"
    if (testError?.message.includes('relation') || testError?.message.includes('landing_leads')) {
      return NextResponse.json(
        {
          success: false,
          message: 'La tabla landing_leads aún no existe',
          instructions: `
            Por favor ejecuta este SQL en tu Supabase:

            CREATE TABLE IF NOT EXISTS landing_leads (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              created_at TIMESTAMPTZ DEFAULT NOW(),
              clinic_name TEXT NOT NULL,
              email TEXT NOT NULL,
              phone TEXT NOT NULL,
              status TEXT DEFAULT 'new',
              notes TEXT DEFAULT ''
            );

            CREATE INDEX IF NOT EXISTS idx_landing_leads_email ON landing_leads(email);
          `,
          steps: [
            'Ve a https://app.supabase.com',
            'Selecciona tu proyecto',
            'SQL Editor → New Query',
            'Pega el SQL arriba',
            'Click RUN'
          ]
        },
        { status: 400 }
      )
    }

    // Si fue exitoso, eliminar el registro de prueba
    if (!testError) {
      await supabase
        .from('landing_leads')
        .delete()
        .eq('email', 'test@test.com')
    }

    return NextResponse.json({
      success: true,
      message: '✅ Tabla landing_leads iniciada exitosamente'
    })

  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        help: 'Intenta crear la tabla manualmente en Supabase SQL Editor'
      },
      { status: 500 }
    )
  }
}

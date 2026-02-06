import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * API Route to initialize landing_leads table
 * GET /api/init/landing-leads
 */
export async function GET() {
  try {
    const supabase = await createClient()

    // Verificamos si la tabla existe con una consulta simple
    const { error: testError } = await supabase
      .from('landing_leads')
      .select('id')
      .limit(1)

    // Si la tabla no existe, el error será "relation does not exist"
    if (testError && (testError.message.includes('relation') || testError.code === 'PGRST116')) {
      return NextResponse.json(
        {
          success: false,
          message: 'La tabla landing_leads aún no existe o no es accesible',
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
          `
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '✅ Tabla landing_leads detectada y lista'
    })

  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}

import { createBrowserClient, createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * FLASH CLINIC - ECOSISTEMA BLINDADO
 * Toda interacción con la base de datos debe pasar exclusivamente por este archivo.
 * No crear nuevas instancias de conexión fuera de estas funciones maestras.
 */

// Cliente para Componentes de Cliente (Client Components)
export function createBrowserSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )
}

// Cliente para Componentes de Servidor, Server Actions y API Routes
export async function createServerSupabaseClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignorar si se llama desde un Server Component puro
          }
        },
      },
    }
  )
}

// Alias de conveniencia para mantener compatibilidad si es necesario
export const createClient = createBrowserSupabaseClient

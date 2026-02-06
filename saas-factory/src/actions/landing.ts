'use server'

import { createClient } from '@/lib/supabase/server'

export async function saveLeadFromLanding(data: {
  clinicName: string
  email: string
  phone: string
}) {
  console.log('Saving lead:', data)
  try {
    const supabase = await createClient()

    // Save lead to landing_leads table
    const { data: lead, error } = await supabase
      .from('landing_leads')
      .insert({
        clinic_name: data.clinicName,
        email: data.email,
        phone: data.phone,
        status: 'new',
        notes: 'Early Beta signup from landing page'
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error saving lead:', error)
      return { 
        success: false, 
        error: `Supabase Error: ${error.message} (Code: ${error.code})` 
      }
    }

    return { success: true, lead }
  } catch (err) {
    console.error('Unexpected error:', err)
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Error interno al guardar datos' 
    }
  }
}

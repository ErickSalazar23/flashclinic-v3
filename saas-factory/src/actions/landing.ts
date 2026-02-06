'use server'

import { createClient } from '@/lib/supabase/server'

export async function saveLeadFromLanding(data: {
  clinicName: string
  email: string
  phone: string
}) {
  try {
    const supabase = createClient()

    // Save lead to landing_leads table (public table without RLS)
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
      console.error('Error saving lead:', error)
      return { success: false, error: error.message }
    }

    return { success: true, lead }
  } catch (err) {
    console.error('Error:', err)
    return { success: false, error: 'Error guardando datos' }
  }
}

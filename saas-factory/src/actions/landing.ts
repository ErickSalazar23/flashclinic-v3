'use server'

import { createClient } from '@/lib/supabase/server'

export async function saveLeadFromLanding(data: {
  clinicName: string
  email: string
  phone: string
}) {
  try {
    const supabase = createClient()

    // Crear un prospect desde el lead de la landing
    const { data: prospect, error } = await supabase
      .from('prospects')
      .insert({
        doctor_name: 'Por confirmar',
        specialty: 'Por confirmar',
        clinic_name: data.clinicName,
        phone: data.phone,
        email: data.email,
        city: 'Por confirmar',
        citas_semanales: 0,
        ticket_promedio: 0,
        no_show_percentage: 0,
        slots_disponibles: 0,
        horas_consulta: 0,
        stage: 'agenda_detenida',
        notes: 'Lead from landing page - Early Beta signup'
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving lead:', error)
      return { success: false, error: error.message }
    }

    return { success: true, prospect }
  } catch (err) {
    console.error('Error:', err)
    return { success: false, error: 'Error guardando datos' }
  }
}

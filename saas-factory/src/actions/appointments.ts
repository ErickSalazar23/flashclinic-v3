'use server'

import { createClient } from '@/lib/supabase/server'

export async function createAppointmentBooking(data: {
  doctorId: string
  patientName: string
  patientPhone: string
  patientEmail: string
  appointmentDate: string
  startTime: string
  endTime: string
}) {
  try {
    const supabase = createClient()

    // Note: Public bookings bypass normal RLS by not requiring user_id
    // In production, consider adding a webhook to notify clinic staff

    // 1. Create patient record (without user_id = public patient)
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .insert({
        name: data.patientName,
        phone: data.patientPhone,
        email: data.patientEmail || null
      })
      .select()
      .single()

    if (patientError) {
      console.error('Patient creation error:', patientError)
      throw new Error('Error al crear registro del paciente')
    }

    // 2. Create appointment record
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .insert({
        doctor_id: data.doctorId,
        patient_id: patient.id,
        appointment_date: data.appointmentDate,
        start_time: data.startTime,
        end_time: data.endTime,
        status: 'pending'
      })
      .select()
      .single()

    if (appointmentError) {
      console.error('Appointment creation error:', appointmentError)
      throw new Error('Error al crear la cita')
    }

    // 3. TODO: Send WhatsApp confirmation
    // TODO: Notify clinic staff via webhook

    return {
      success: true,
      appointment,
      message: 'Cita agendada con éxito. Te enviaremos confirmación por WhatsApp.'
    }
  } catch (error) {
    console.error('Booking error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al agendar la cita',
      appointment: null
    }
  }
}

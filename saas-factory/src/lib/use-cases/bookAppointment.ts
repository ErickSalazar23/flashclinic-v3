import { createClient } from "@/lib/supabase/client"
import { Appointment, Patient } from "@/types"

export async function bookAppointment(data: {
  doctorId: string
  patientData: Omit<Patient, "id" | "created_at">
  appointmentDate: string
  startTime: string
  endTime: string
}) {
  const supabase = createClient()

  // 1. Crear/encontrar paciente
  const { data: patient, error: patientError } = await supabase
    .from("patients")
    .insert({
      name: data.patientData.name,
      phone: data.patientData.phone,
      email: data.patientData.email
    })
    .select()
    .single()

  if (patientError) throw patientError

  // 2. Crear cita
  const { data: appointment, error: appointmentError } = await supabase
    .from("appointments")
    .insert({
      doctor_id: data.doctorId,
      patient_id: patient.id,
      appointment_date: data.appointmentDate,
      start_time: data.startTime,
      end_time: data.endTime,
      status: "pending"
    })
    .select()
    .single()

  if (appointmentError) throw appointmentError

  // 3. Enviar confirmación por WhatsApp (próximo paso)
  // await sendWhatsAppConfirmation(appointment)

  return appointment
}

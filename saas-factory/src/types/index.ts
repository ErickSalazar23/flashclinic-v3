export interface Patient {
  id: string
  created_at: string
  name: string
  phone: string
  email?: string
  user_id?: string
}

export interface Appointment {
  id: string
  created_at: string
  doctor_id: string
  patient_id: string
  appointment_date: string
  start_time: string
  end_time: string
  status: "pending" | "confirmed" | "cancelled" | "completed" | "no_show"
  notes?: string
  user_id?: string
}

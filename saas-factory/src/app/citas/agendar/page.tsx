"use client"

import { useState } from "react"
import { bookAppointment } from "@/lib/use-cases/bookAppointment"

export default function AgendarPage() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    doctorId: "dr-juan-perez",
    doctorName: "Dr. Juan Pérez",
    specialty: "Medicina General",
    date: "2026-02-04",
    startTime: "09:00:00",
    endTime: "09:30:00"
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleNext = () => setStep(step + 1)
  const handleBack = () => setStep(step - 1)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await bookAppointment({
        doctorId: formData.doctorId,
        patientData: {
          name: formData.name,
          phone: formData.phone,
          email: formData.email
        },
        appointmentDate: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime
      })
      setIsSuccess(true)
    } catch (error) {
      console.error("Error booking appointment:", error)
      alert("Error al agendar la cita. Por favor intenta de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="text-6xl mb-4 text-green-500">✅</div>
          <h2 className="text-2xl font-bold mb-2">¡Cita agendada con éxito!</h2>
          <p className="text-gray-600 mb-6">Te hemos enviado una confirmación por WhatsApp.</p>
          <button 
            onClick={() => window.location.href = "/citas"}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm mb-2">
            <span className={step >= 1 ? "text-blue-600 font-semibold" : "text-gray-400"}>
              1. Doctor
            </span>
            <span className={step >= 2 ? "text-blue-600 font-semibold" : "text-gray-400"}>
              2. Horario
            </span>
            <span className={step >= 3 ? "text-blue-600 font-semibold" : "text-gray-400"}>
              3. Confirmar
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div 
              className="h-2 bg-blue-600 rounded-full transition-all"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Contenido de cada paso */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {step === 1 && (
            <StepDoctor 
              onNext={(name, specialty) => {
                setFormData({ ...formData, doctorName: name, specialty });
                handleNext();
              }} 
            />
          )}
          {step === 2 && (
            <StepHorario 
              onNext={(time) => {
                setFormData({ ...formData, startTime: time });
                handleNext();
              }} 
              onBack={handleBack} 
            />
          )}
          {step === 3 && (
            <StepConfirmar 
              formData={formData}
              setFormData={(data: any) => setFormData({ ...formData, ...data })}
              onBack={handleBack}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
      </div>
    </div>
  )
}

function StepDoctor({ onNext }: { onNext: (name: string, specialty: string) => void }) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-900">
        Selecciona tu doctor
      </h2>
      
      <div className="space-y-4">
        <DoctorOption 
          name="Dr. Juan Pérez" 
          specialty="Medicina General"
          onClick={() => onNext("Dr. Juan Pérez", "Medicina General")}
        />
        <DoctorOption 
          name="Dra. María González" 
          specialty="Odontología"
          onClick={() => onNext("Dra. María González", "Odontología")}
        />
      </div>
    </div>
  )
}

function DoctorOption({ name, specialty, onClick }: { name: string; specialty: string; onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center p-4 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
    >
      <div className="w-12 h-12 bg-gray-200 rounded-full mr-4 flex items-center justify-center text-xl">
        👤
      </div>
      <div>
        <p className="font-bold text-lg text-gray-900">{name}</p>
        <p className="text-gray-600">{specialty}</p>
      </div>
    </button>
  )
}

function StepHorario({ onNext, onBack }: { onNext: (time: string) => void; onBack: () => void }) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-900">
        ¿Cuándo quieres tu cita?
      </h2>
      
      <div className="grid grid-cols-3 gap-3 mb-6">
        <button className="p-4 border-2 border-blue-500 rounded-lg font-semibold text-blue-600">
          Hoy
        </button>
        <button className="p-4 border-2 border-gray-300 rounded-lg hover:border-blue-500 text-gray-600">
          Mañana
        </button>
        <button className="p-4 border-2 border-gray-300 rounded-lg hover:border-blue-500 text-gray-600">
          Vie 7
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-8">
        <button className="p-3 bg-blue-600 text-white rounded-lg" onClick={() => onNext("09:00:00")}>
          9:00 AM
        </button>
        <button className="p-3 bg-blue-600 text-white rounded-lg" onClick={() => onNext("10:00:00")}>
          10:00 AM
        </button>
        <button className="p-3 bg-gray-200 text-gray-400 rounded-lg" disabled>
          11:00 AM
        </button>
        <button className="p-3 bg-blue-600 text-white rounded-lg" onClick={() => onNext("15:00:00")}>
          3:00 PM
        </button>
      </div>

      <button onClick={onBack} className="text-gray-600 font-medium">
        ← Cambiar doctor
      </button>
    </div>
  )
}

function StepConfirmar({ formData, setFormData, onBack, onSubmit, isSubmitting }: any) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-900">
        Confirma tu cita
      </h2>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <p className="font-semibold text-lg mb-2 text-gray-900">{formData.doctorName}</p>
        <p className="text-gray-600">{formData.specialty}</p>
        <p className="text-gray-600 mt-4">
          <strong>Fecha:</strong> {formData.date}<br />
          <strong>Hora:</strong> {formData.startTime}
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4 mb-6">
        <input 
          type="text" 
          placeholder="Tu nombre completo"
          className="w-full px-4 py-3 border rounded-lg text-gray-900"
          value={formData.name}
          onChange={(e) => setFormData({ name: e.target.value })}
          required
        />
        <input 
          type="tel" 
          placeholder="WhatsApp"
          className="w-full px-4 py-3 border rounded-lg text-gray-900"
          value={formData.phone}
          onChange={(e) => setFormData({ phone: e.target.value })}
          required
        />
        <input 
          type="email" 
          placeholder="Email (opcional)"
          className="w-full px-4 py-3 border rounded-lg text-gray-900"
          value={formData.email}
          onChange={(e) => setFormData({ email: e.target.value })}
        />
        
        <button 
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
        >
          {isSubmitting ? "Confirmando..." : "Confirmar cita →"}
        </button>
      </form>

      <button onClick={onBack} className="text-gray-600 font-medium">
        ← Cambiar horario
      </button>
    </div>
  )
}

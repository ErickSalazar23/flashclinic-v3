'use client'

import { useState, useTransition } from 'react'
import { createProspect, CreateProspectInput } from '@/actions/prospects'
import { useRouter } from 'next/navigation'

interface ProspectFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function ProspectForm({ onSuccess, onCancel }: ProspectFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)

    const input: CreateProspectInput = {
      doctorName: formData.get('doctorName') as string,
      specialty: formData.get('specialty') as string,
      clinicName: formData.get('clinicName') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      city: formData.get('city') as string,
      citasSemanales: Number(formData.get('citasSemanales')),
      ticketPromedio: Number(formData.get('ticketPromedio')),
      noShowPercentage: Number(formData.get('noShowPercentage')),
      slotsDisponibles: Number(formData.get('slotsDisponibles')),
      horasConsulta: Number(formData.get('horasConsulta')),
      notes: formData.get('notes') as string
    }

    startTransition(async () => {
      const result = await createProspect(input)

      if (!result.ok) {
        setError(result.error)
        return
      }

      router.refresh()
      onSuccess?.()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-500/10 border border-red-500/20 p-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Doctor/Clinic Info */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">Información del Doctor</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Nombre del Doctor *</label>
            <input
              type="text"
              name="doctorName"
              required
              className="input"
              placeholder="Dr. Juan Pérez"
            />
          </div>

          <div>
            <label className="label">Especialidad *</label>
            <input
              type="text"
              name="specialty"
              required
              className="input"
              placeholder="Odontología"
            />
          </div>

          <div>
            <label className="label">Nombre de la Clínica *</label>
            <input
              type="text"
              name="clinicName"
              required
              className="input"
              placeholder="Clínica Dental Sonrisa"
            />
          </div>

          <div>
            <label className="label">Ciudad *</label>
            <input
              type="text"
              name="city"
              required
              className="input"
              placeholder="Madrid"
            />
          </div>

          <div>
            <label className="label">Teléfono *</label>
            <input
              type="tel"
              name="phone"
              required
              className="input"
              placeholder="+34 600 000 000"
            />
          </div>

          <div>
            <label className="label">Email *</label>
            <input
              type="email"
              name="email"
              required
              className="input"
              placeholder="doctor@clinica.com"
            />
          </div>
        </div>
      </div>

      {/* Practice Metrics */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">Métricas de la Práctica</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="label">Citas Semanales *</label>
            <input
              type="number"
              name="citasSemanales"
              required
              min="0"
              className="input"
              placeholder="40"
            />
          </div>

          <div>
            <label className="label">Ticket Promedio (EUR) *</label>
            <input
              type="number"
              name="ticketPromedio"
              required
              min="0"
              className="input"
              placeholder="150"
            />
          </div>

          <div>
            <label className="label">% No-Show *</label>
            <input
              type="number"
              name="noShowPercentage"
              required
              min="0"
              max="100"
              step="0.1"
              className="input"
              placeholder="15"
            />
          </div>

          <div>
            <label className="label">Slots Disponibles/Semana *</label>
            <input
              type="number"
              name="slotsDisponibles"
              required
              min="0"
              className="input"
              placeholder="60"
            />
          </div>

          <div>
            <label className="label">Horas de Consulta/Semana *</label>
            <input
              type="number"
              name="horasConsulta"
              required
              min="0"
              className="input"
              placeholder="40"
            />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">Notas</h3>

        <textarea
          name="notes"
          rows={4}
          className="input"
          placeholder="Notas adicionales sobre el prospecto..."
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-ghost"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={isPending}
          className="btn btn-primary"
        >
          {isPending ? 'Creando...' : 'Crear Prospecto'}
        </button>
      </div>
    </form>
  )
}

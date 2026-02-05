export type DecisionStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'DEFERRED'
export type DecisionType = 'prospect_review' | 'follow_up' | 'deal_approval' | 'treatment_plan'
export type DecisionPriority = 'high' | 'medium' | 'low'

export interface Decision {
  id: string
  createdAt: string
  updatedAt: string

  type: DecisionType
  status: DecisionStatus
  priority: DecisionPriority

  title: string
  description: string

  prospectId?: string
  prospectName?: string

  dueDate?: string
  decidedAt?: string
  decidedBy?: string

  metadata?: Record<string, any>
}

export interface DecisionFilters {
  status?: DecisionStatus
  type?: DecisionType
  priority?: DecisionPriority
}

export const DECISION_TYPE_LABELS: Record<DecisionType, string> = {
  prospect_review: 'Revisión de Prospecto',
  follow_up: 'Seguimiento',
  deal_approval: 'Aprobación de Deal',
  treatment_plan: 'Plan de Tratamiento'
}

export const DECISION_PRIORITY_LABELS: Record<DecisionPriority, string> = {
  high: 'Alta',
  medium: 'Media',
  low: 'Baja'
}

export const DECISION_STATUS_LABELS: Record<DecisionStatus, string> = {
  PENDING: 'Pendiente',
  APPROVED: 'Aprobado',
  REJECTED: 'Rechazado',
  DEFERRED: 'Diferido'
}

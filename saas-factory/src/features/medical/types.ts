/**
 * Flash Clinic V3 - Medical Data Models
 * Ported from legacy crm/data-models.js
 */

export type SeverityType = 'critical' | 'severe' | 'moderate' | 'stable';
export type StageType = 'agenda_detenida' | 'diagnostico_proceso' | 'tratamiento_aplicado' | 'recuperacion_exitosa';

export interface Activity {
  id: string;
  prospectId: string;
  type: 'note' | 'call' | 'email' | 'meeting' | 'stage_change';
  description: string;
  timestamp: string;
  user: string;
  metadata?: Record<string, any>;
}

export interface Recommendation {
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string | number;
}

export interface Diagnostic {
  id: string;
  prospectId: string;
  calculatedAt: string;
  
  // Input Metrics
  citasSemanales: number;
  ticketPromedio: number;
  noShowPercentage: number;
  slotsDisponibles: number;
  horasConsulta: number;
  
  // Calculated Metrics
  sillaVaciaPercentage: number;
  rentabilidadPercentage: number;
  perdidaAnual: number;
  perdidaNoShow: number;
  costoOportunidad: number;
  citasCompletadas: number;
  ingresoActual: number;
  ingresoPotencial: number;
  
  // Severity Classification
  severity: SeverityType;
  severityScore: number;
  
  // Clinical Report
  diagnosticText: string;
  recommendations: Recommendation[];
}

export interface Prospect {
  id: string;
  createdAt: string;
  updatedAt: string;
  
  // Doctor/Clinic Info
  doctorName: string;
  specialty: string;
  clinicName: string;
  phone: string;
  email: string;
  city: string;
  
  // Practice Metrics
  citasSemanales: number;
  ticketPromedio: number;
  noShowPercentage: number;
  slotsDisponibles: number;
  horasConsulta: number;
  
  // Pipeline
  stage: StageType;
  stageUpdatedAt: string;
  
  // Diagnostic
  diagnostic: Diagnostic | null;
  
  // Business Value
  dealValue: number;
  ltv: number;
  closedAt: string | null;
  
  // History
  activities: Activity[];
  notes: string;
  nextFollowUp: string | null;
}

export interface MedicalSettings {
  semanasAnuales: number;
  monedaSimbolo: string;
  monedaCodigo: string;
  thresholds: {
    critical: number;
    severe: number;
    moderate: number;
  };
}

export const DEFAULT_SETTINGS: MedicalSettings = {
  semanasAnuales: 48,
  monedaSimbolo: '€',
  monedaCodigo: 'EUR',
  thresholds: {
    critical: 40,
    severe: 25,
    moderate: 15
  }
};

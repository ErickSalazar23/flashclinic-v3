/**
 * Enterprise CRM Flash Clinic - Data Models
 * Cyber-Medicine Edition
 * 
 * Core data structures for prospect management and diagnostic analysis
 */

// ============================================================================
// PROSPECT MODEL
// ============================================================================

class Prospect {
  constructor(data = {}) {
    this.id = data.id || this.generateId();
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    
    // Doctor Information
    this.doctorName = data.doctorName || '';
    this.specialty = data.specialty || '';
    this.clinicName = data.clinicName || '';
    this.phone = data.phone || '';
    this.email = data.email || '';
    this.city = data.city || '';
    
    // Practice Metrics (Input Data)
    this.citasSemanales = data.citasSemanales || 0;        // Citas agendadas por semana
    this.ticketPromedio = data.ticketPromedio || 0;        // Ticket promedio en COP
    this.noShowPercentage = data.noShowPercentage || 0;    // % de no-show
    this.slotsDisponibles = data.slotsDisponibles || 0;    // Slots totales disponibles
    this.horasConsulta = data.horasConsulta || 0;          // Horas de consulta por semana
    
    // Pipeline Stage
    this.stage = data.stage || 'agenda_detenida';          // agenda_detenida | diagnostico_proceso | tratamiento_aplicado | recuperacion_exitosa
    this.stageUpdatedAt = data.stageUpdatedAt || new Date().toISOString();
    
    // Diagnostic Results (Calculated)
    this.diagnostic = data.diagnostic || null;
    
    // Deal Information
    this.dealValue = data.dealValue || 0;                  // Valor del contrato
    this.ltv = data.ltv || 0;                              // Lifetime Value
    this.closedAt = data.closedAt || null;
    
    // Activity Tracking
    this.activities = data.activities || [];
    this.notes = data.notes || '';
    this.nextFollowUp = data.nextFollowUp || null;
  }
  
  generateId() {
    return `prospect_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  // Update prospect data
  update(data) {
    Object.assign(this, data);
    this.updatedAt = new Date().toISOString();
    return this;
  }
  
  // Move to next pipeline stage
  moveToStage(newStage) {
    this.stage = newStage;
    this.stageUpdatedAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
    
    // Add activity log
    this.addActivity({
      type: 'stage_change',
      description: `Movido a: ${this.getStageLabel(newStage)}`,
      timestamp: new Date().toISOString()
    });
    
    return this;
  }
  
  // Add activity to timeline
  addActivity(activity) {
    this.activities.push({
      id: `activity_${Date.now()}`,
      type: activity.type || 'note',
      description: activity.description || '',
      timestamp: activity.timestamp || new Date().toISOString(),
      user: activity.user || 'Sistema'
    });
    this.updatedAt = new Date().toISOString();
    return this;
  }
  
  // Get human-readable stage label
  getStageLabel(stage = this.stage) {
    const labels = {
      'agenda_detenida': 'Agenda Detenida (Bypass Fallido)',
      'diagnostico_proceso': 'Diagnóstico en Proceso (Demo)',
      'tratamiento_aplicado': 'Tratamiento Aplicado (Cierre)',
      'recuperacion_exitosa': 'Recuperación Exitosa (LTV)'
    };
    return labels[stage] || stage;
  }
  
  // Get severity color based on diagnostic
  getSeverityColor() {
    if (!this.diagnostic) return '#666';
    
    const severity = this.diagnostic.severity;
    const colors = {
      'critical': '#ff0055',
      'severe': '#ff6b00',
      'moderate': '#ffaa00',
      'stable': '#00d2ff'
    };
    return colors[severity] || '#666';
  }
  
  // Convert to plain object for storage
  toJSON() {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      doctorName: this.doctorName,
      specialty: this.specialty,
      clinicName: this.clinicName,
      phone: this.phone,
      email: this.email,
      city: this.city,
      citasSemanales: this.citasSemanales,
      ticketPromedio: this.ticketPromedio,
      noShowPercentage: this.noShowPercentage,
      slotsDisponibles: this.slotsDisponibles,
      horasConsulta: this.horasConsulta,
      stage: this.stage,
      stageUpdatedAt: this.stageUpdatedAt,
      diagnostic: this.diagnostic,
      dealValue: this.dealValue,
      ltv: this.ltv,
      closedAt: this.closedAt,
      activities: this.activities,
      notes: this.notes,
      nextFollowUp: this.nextFollowUp
    };
  }
  
  // Create from plain object
  static fromJSON(json) {
    return new Prospect(json);
  }
}

// ============================================================================
// DIAGNOSTIC MODEL
// ============================================================================

class Diagnostic {
  constructor(data = {}) {
    this.id = data.id || this.generateId();
    this.prospectId = data.prospectId || '';
    this.calculatedAt = data.calculatedAt || new Date().toISOString();
    
    // Input Metrics
    this.citasSemanales = data.citasSemanales || 0;
    this.ticketPromedio = data.ticketPromedio || 0;
    this.noShowPercentage = data.noShowPercentage || 0;
    this.slotsDisponibles = data.slotsDisponibles || 0;
    this.horasConsulta = data.horasConsulta || 0;
    
    // Calculated Metrics
    this.sillaVaciaPercentage = data.sillaVaciaPercentage || 0;
    this.rentabilidadPercentage = data.rentabilidadPercentage || 0;
    this.perdidaAnual = data.perdidaAnual || 0;
    this.perdidaNoShow = data.perdidaNoShow || 0;
    this.costoOportunidad = data.costoOportunidad || 0;
    this.citasCompletadas = data.citasCompletadas || 0;
    this.ingresoActual = data.ingresoActual || 0;
    this.ingresoPotencial = data.ingresoPotencial || 0;
    
    // Severity Classification
    this.severity = data.severity || 'stable';  // critical | severe | moderate | stable
    this.severityScore = data.severityScore || 0;  // 0-100
    
    // Clinical Report
    this.diagnosticText = data.diagnosticText || '';
    this.recommendations = data.recommendations || [];
  }
  
  generateId() {
    return `diagnostic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  // Convert to plain object
  toJSON() {
    return {
      id: this.id,
      prospectId: this.prospectId,
      calculatedAt: this.calculatedAt,
      citasSemanales: this.citasSemanales,
      ticketPromedio: this.ticketPromedio,
      noShowPercentage: this.noShowPercentage,
      slotsDisponibles: this.slotsDisponibles,
      horasConsulta: this.horasConsulta,
      sillaVaciaPercentage: this.sillaVaciaPercentage,
      rentabilidadPercentage: this.rentabilidadPercentage,
      perdidaAnual: this.perdidaAnual,
      perdidaNoShow: this.perdidaNoShow,
      costoOportunidad: this.costoOportunidad,
      citasCompletadas: this.citasCompletadas,
      ingresoActual: this.ingresoActual,
      ingresoPotencial: this.ingresoPotencial,
      severity: this.severity,
      severityScore: this.severityScore,
      diagnosticText: this.diagnosticText,
      recommendations: this.recommendations
    };
  }
  
  static fromJSON(json) {
    return new Diagnostic(json);
  }
}

// ============================================================================
// ACTIVITY MODEL
// ============================================================================

class Activity {
  constructor(data = {}) {
    this.id = data.id || this.generateId();
    this.prospectId = data.prospectId || '';
    this.type = data.type || 'note';  // note | call | email | meeting | stage_change
    this.description = data.description || '';
    this.timestamp = data.timestamp || new Date().toISOString();
    this.user = data.user || 'Sistema';
    this.metadata = data.metadata || {};
  }
  
  generateId() {
    return `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  toJSON() {
    return {
      id: this.id,
      prospectId: this.prospectId,
      type: this.type,
      description: this.description,
      timestamp: this.timestamp,
      user: this.user,
      metadata: this.metadata
    };
  }
  
  static fromJSON(json) {
    return new Activity(json);
  }
}

// ============================================================================
// SETTINGS MODEL
// ============================================================================

class Settings {
  constructor(data = {}) {
    // Calculation Parameters
    this.semanasAnuales = data.semanasAnuales || 48;  // Semanas laborales al año
    this.monedaSimbolo = data.monedaSimbolo || '$';
    this.monedaCodigo = data.monedaCodigo || 'COP';
    
    // Severity Thresholds
    this.thresholds = data.thresholds || {
      critical: 40,    // > 40% pérdida = crítico
      severe: 25,      // > 25% pérdida = severo
      moderate: 15     // > 15% pérdida = moderado
    };
    
    // User Preferences
    this.darkMode = data.darkMode !== undefined ? data.darkMode : true;
    this.notifications = data.notifications !== undefined ? data.notifications : true;
  }
  
  toJSON() {
    return {
      semanasAnuales: this.semanasAnuales,
      monedaSimbolo: this.monedaSimbolo,
      monedaCodigo: this.monedaCodigo,
      thresholds: this.thresholds,
      darkMode: this.darkMode,
      notifications: this.notifications
    };
  }
  
  static fromJSON(json) {
    return new Settings(json);
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Prospect, Diagnostic, Activity, Settings };
}

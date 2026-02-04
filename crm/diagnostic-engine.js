/**
 * Enterprise CRM Flash Clinic - Diagnostic Engine
 * Cyber-Medicine Edition
 * 
 * Financial Hemorrhage Analysis & Clinical Language Generation
 */

class DiagnosticEngine {
  constructor(settings = null) {
    this.settings = settings || new Settings();
  }
  
  /**
   * Main diagnostic calculation method
   * Analyzes practice metrics and generates complete diagnostic report
   * 
   * @param {Object} metrics - Practice metrics
   * @returns {Diagnostic} - Complete diagnostic object
   */
  analyze(metrics) {
    const diagnostic = new Diagnostic({
      prospectId: metrics.prospectId || '',
      citasSemanales: metrics.citasSemanales || 0,
      ticketPromedio: metrics.ticketPromedio || 0,
      noShowPercentage: metrics.noShowPercentage || 0,
      slotsDisponibles: metrics.slotsDisponibles || 0,
      horasConsulta: metrics.horasConsulta || 0
    });
    
    // Calculate all financial metrics
    this.calculateMetrics(diagnostic);
    
    // Determine severity level
    this.calculateSeverity(diagnostic);
    
    // Generate clinical diagnostic text
    diagnostic.diagnosticText = this.generateDiagnosticText(diagnostic);
    
    // Generate treatment recommendations
    diagnostic.recommendations = this.generateRecommendations(diagnostic);
    
    return diagnostic;
  }
  
  /**
   * Calculate all financial hemorrhage metrics
   */
  calculateMetrics(diagnostic) {
    const {
      citasSemanales,
      ticketPromedio,
      noShowPercentage,
      slotsDisponibles
    } = diagnostic;
    
    // Citas completadas (después de no-shows)
    diagnostic.citasCompletadas = citasSemanales * (1 - noShowPercentage / 100);
    
    // Pérdida por No-Show
    const citasNoShow = citasSemanales * (noShowPercentage / 100);
    diagnostic.perdidaNoShow = citasNoShow * ticketPromedio * this.settings.semanasAnuales;
    
    // Sillas vacías (slots no utilizados)
    const sillasVacias = Math.max(0, slotsDisponibles - citasSemanales);
    
    // % Silla Vacía
    diagnostic.sillaVaciaPercentage = slotsDisponibles > 0 
      ? (sillasVacias / slotsDisponibles) * 100 
      : 0;
    
    // Costo de Oportunidad (sillas vacías)
    diagnostic.costoOportunidad = sillasVacias * ticketPromedio * this.settings.semanasAnuales;
    
    // Pérdida Anual Total
    diagnostic.perdidaAnual = diagnostic.perdidaNoShow + diagnostic.costoOportunidad;
    
    // Ingreso Actual
    diagnostic.ingresoActual = diagnostic.citasCompletadas * ticketPromedio * this.settings.semanasAnuales;
    
    // Ingreso Potencial (100% ocupación, 0% no-show)
    diagnostic.ingresoPotencial = slotsDisponibles * ticketPromedio * this.settings.semanasAnuales;
    
    // % Rentabilidad (ingreso actual vs potencial)
    diagnostic.rentabilidadPercentage = diagnostic.ingresoPotencial > 0
      ? (diagnostic.ingresoActual / diagnostic.ingresoPotencial) * 100
      : 0;
    
    return diagnostic;
  }
  
  /**
   * Calculate severity level based on financial hemorrhage
   */
  calculateSeverity(diagnostic) {
    // Calculate severity score (0-100) based on multiple factors
    const perdidaPercentage = diagnostic.ingresoPotencial > 0
      ? (diagnostic.perdidaAnual / diagnostic.ingresoPotencial) * 100
      : 0;
    
    const sillaVaciaFactor = diagnostic.sillaVaciaPercentage;
    const noShowFactor = diagnostic.noShowPercentage;
    
    // Weighted severity score
    diagnostic.severityScore = (
      perdidaPercentage * 0.5 +
      sillaVaciaFactor * 0.3 +
      noShowFactor * 0.2
    );
    
    // Classify severity
    const { thresholds } = this.settings;
    
    if (diagnostic.severityScore >= thresholds.critical) {
      diagnostic.severity = 'critical';
    } else if (diagnostic.severityScore >= thresholds.severe) {
      diagnostic.severity = 'severe';
    } else if (diagnostic.severityScore >= thresholds.moderate) {
      diagnostic.severity = 'moderate';
    } else {
      diagnostic.severity = 'stable';
    }
    
    return diagnostic;
  }
  
  /**
   * Generate clinical diagnostic text with aggressive medical language
   */
  generateDiagnosticText(diagnostic) {
    const { severity } = diagnostic;
    
    let report = '';
    
    // Header based on severity
    switch (severity) {
      case 'critical':
        report += '🚨 **HEMORRAGIA CRÍTICA DETECTADA**\n\n';
        report += '**ESTADO**: Pérdida masiva de recursos. Intervención inmediata requerida.\n\n';
        break;
      case 'severe':
        report += '⚠️ **HEMORRAGIA SEVERA EN CURSO**\n\n';
        report += '**ESTADO**: Sangrado significativo de ingresos. Tratamiento urgente necesario.\n\n';
        break;
      case 'moderate':
        report += '⚡ **HEMORRAGIA MODERADA IDENTIFICADA**\n\n';
        report += '**ESTADO**: Pérdida controlable pero persistente. Intervención recomendada.\n\n';
        break;
      default:
        report += '✓ **OPERACIÓN ESTABLE**\n\n';
        report += '**ESTADO**: Flujo de ingresos saludable. Optimización preventiva disponible.\n\n';
    }
    
    // Financial Hemorrhage Analysis
    report += '## 📊 ANÁLISIS DE HEMORRAGIA FINANCIERA\n\n';
    
    report += `**Pérdida Anual Total**: ${this.formatCurrency(diagnostic.perdidaAnual)}\n`;
    report += `- Pérdida por No-Show: ${this.formatCurrency(diagnostic.perdidaNoShow)}\n`;
    report += `- Costo de Oportunidad (Sillas Vacías): ${this.formatCurrency(diagnostic.costoOportunidad)}\n\n`;
    
    // Capacity Analysis
    report += '## 🏥 ANÁLISIS DE CAPACIDAD OPERATIVA\n\n';
    
    report += `**Silla Vacía**: ${diagnostic.sillaVaciaPercentage.toFixed(1)}%\n`;
    report += `**Rentabilidad Actual**: ${diagnostic.rentabilidadPercentage.toFixed(1)}%\n`;
    report += `**Tasa de No-Show**: ${diagnostic.noShowPercentage.toFixed(1)}%\n\n`;
    
    // Revenue Analysis
    report += '## 💰 ANÁLISIS DE INGRESOS\n\n';
    
    report += `**Ingreso Actual Anual**: ${this.formatCurrency(diagnostic.ingresoActual)}\n`;
    report += `**Ingreso Potencial Anual**: ${this.formatCurrency(diagnostic.ingresoPotencial)}\n`;
    report += `**Brecha de Ingresos**: ${this.formatCurrency(diagnostic.perdidaAnual)}\n\n`;
    
    // Clinical Interpretation
    report += '## 🩺 INTERPRETACIÓN CLÍNICA\n\n';
    
    if (severity === 'critical') {
      report += 'La práctica presenta una **hemorragia crítica de recursos**. ';
      report += `Con ${diagnostic.sillaVaciaPercentage.toFixed(0)}% de capacidad sin utilizar y ${diagnostic.noShowPercentage.toFixed(0)}% de no-shows, `;
      report += 'el quirófano financiero está operando en estado de emergencia. ';
      report += '\n\n';
      report += '**DIAGNÓSTICO**: Erosión masiva de autoridad médica y colapso de eficiencia operativa. ';
      report += 'Cada día sin intervención representa una hemorragia continua de ';
      report += `${this.formatCurrency(diagnostic.perdidaAnual / 365)} diarios.\n\n`;
      
    } else if (severity === 'severe') {
      report += 'La práctica sufre **sangrado severo de ingresos**. ';
      report += 'La combinación de sillas vacías y no-shows está drenando recursos significativos. ';
      report += '\n\n';
      report += '**DIAGNÓSTICO**: Pérdida de control operativo con impacto directo en autoridad profesional. ';
      report += 'Tratamiento urgente puede recuperar ';
      report += `${this.formatCurrency(diagnostic.perdidaAnual)} anuales.\n\n`;
      
    } else if (severity === 'moderate') {
      report += 'La práctica presenta **hemorragia moderada pero persistente**. ';
      report += 'Aunque estable, existe potencial significativo de optimización. ';
      report += '\n\n';
      report += '**DIAGNÓSTICO**: Oportunidad de fortalecimiento operativo. ';
      report += 'Intervención preventiva puede capturar ';
      report += `${this.formatCurrency(diagnostic.perdidaAnual)} adicionales anuales.\n\n`;
      
    } else {
      report += 'La práctica mantiene **operación saludable**. ';
      report += 'Los indicadores muestran gestión eficiente de recursos. ';
      report += '\n\n';
      report += '**DIAGNÓSTICO**: Sistema operativo optimizado. ';
      report += 'Oportunidades de mejora incremental disponibles.\n\n';
    }
    
    // Authority Erosion Warning
    if (severity === 'critical' || severity === 'severe') {
      report += '## ⚠️ EROSIÓN DE AUTORIDAD MÉDICA\n\n';
      report += 'Cada silla vacía y cada no-show no solo representa pérdida financiera, ';
      report += 'sino **erosión de autoridad profesional**:\n\n';
      report += '- Pacientes que no valoran el tiempo del médico\n';
      report += '- Agenda desorganizada que proyecta falta de demanda\n';
      report += '- Pérdida de momentum en construcción de reputación\n';
      report += '- Reducción de casos tratados = menos experiencia acumulada\n\n';
    }
    
    return report;
  }
  
  /**
   * Generate treatment recommendations based on severity
   */
  generateRecommendations(diagnostic) {
    const recommendations = [];
    const { severity } = diagnostic;
    
    // Critical recommendations
    if (severity === 'critical') {
      recommendations.push({
        priority: 'critical',
        title: 'Implementación Inmediata de Sistema de Confirmación',
        description: 'Reducir no-shows del ' + diagnostic.noShowPercentage.toFixed(0) + '% al 5% mediante recordatorios automatizados',
        impact: this.formatCurrency(diagnostic.perdidaNoShow * 0.75)
      });
      
      recommendations.push({
        priority: 'critical',
        title: 'Optimización de Agenda y Overbooking Estratégico',
        description: 'Eliminar sillas vacías mediante gestión predictiva de capacidad',
        impact: this.formatCurrency(diagnostic.costoOportunidad * 0.6)
      });
      
      recommendations.push({
        priority: 'high',
        title: 'Sistema de Lista de Espera Activa',
        description: 'Convertir cancelaciones en oportunidades mediante lista de espera dinámica',
        impact: this.formatCurrency(diagnostic.perdidaAnual * 0.3)
      });
    }
    
    // Severe recommendations
    if (severity === 'severe') {
      recommendations.push({
        priority: 'high',
        title: 'Protocolo Anti-NoShow',
        description: 'Implementar confirmación 48h antes + recordatorio 24h antes',
        impact: this.formatCurrency(diagnostic.perdidaNoShow * 0.6)
      });
      
      recommendations.push({
        priority: 'high',
        title: 'Optimización de Horarios',
        description: 'Ajustar disponibilidad según demanda real y patrones de asistencia',
        impact: this.formatCurrency(diagnostic.costoOportunidad * 0.4)
      });
    }
    
    // Moderate recommendations
    if (severity === 'moderate') {
      recommendations.push({
        priority: 'medium',
        title: 'Mejora de Tasa de Conversión',
        description: 'Optimizar proceso de agendamiento para reducir fricción',
        impact: this.formatCurrency(diagnostic.perdidaAnual * 0.4)
      });
      
      recommendations.push({
        priority: 'medium',
        title: 'Sistema de Seguimiento Post-Consulta',
        description: 'Incrementar retención y recurrencia de pacientes',
        impact: this.formatCurrency(diagnostic.ingresoPotencial * 0.15)
      });
    }
    
    // Universal recommendations
    recommendations.push({
      priority: 'low',
      title: 'Dashboard de Métricas en Tiempo Real',
      description: 'Monitoreo continuo de KPIs operativos para detección temprana',
      impact: 'Prevención de hemorragias futuras'
    });
    
    return recommendations;
  }
  
  /**
   * Format currency in Colombian Pesos
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: this.settings.monedaCodigo,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }
  
  /**
   * Generate quick summary for dashboard
   */
  generateQuickSummary(diagnostic) {
    const { severity } = diagnostic;
    
    const severityLabels = {
      'critical': 'CRÍTICO',
      'severe': 'SEVERO',
      'moderate': 'MODERADO',
      'stable': 'ESTABLE'
    };
    
    return {
      severity: severityLabels[severity],
      severityScore: diagnostic.severityScore.toFixed(0),
      perdidaAnual: this.formatCurrency(diagnostic.perdidaAnual),
      sillaVacia: diagnostic.sillaVaciaPercentage.toFixed(1) + '%',
      rentabilidad: diagnostic.rentabilidadPercentage.toFixed(1) + '%',
      headline: this.generateHeadline(diagnostic)
    };
  }
  
  /**
   * Generate attention-grabbing headline
   */
  generateHeadline(diagnostic) {
    const { severity, perdidaAnual } = diagnostic;
    
    if (severity === 'critical') {
      return `🚨 Hemorragia Crítica: ${this.formatCurrency(perdidaAnual)} en pérdidas anuales`;
    } else if (severity === 'severe') {
      return `⚠️ Sangrado Severo: ${this.formatCurrency(perdidaAnual)} sin recuperar`;
    } else if (severity === 'moderate') {
      return `⚡ Oportunidad: ${this.formatCurrency(perdidaAnual)} recuperables`;
    } else {
      return `✓ Operación Estable: ${this.formatCurrency(diagnostic.ingresoActual)} anuales`;
    }
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DiagnosticEngine };
}

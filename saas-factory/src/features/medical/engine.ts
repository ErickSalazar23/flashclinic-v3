/**
 * Flash Clinic V3 - Diagnostic Engine
 * Ported from legacy crm/diagnostic-engine.js
 * 
 * Clinical analysis for financial "hemorrhage" in medical practices.
 */

import { 
  Diagnostic, 
  MedicalSettings, 
  DEFAULT_SETTINGS, 
  SeverityType, 
  Recommendation 
} from './types';

export class DiagnosticEngine {
  private settings: MedicalSettings;

  constructor(settings: MedicalSettings = DEFAULT_SETTINGS) {
    this.settings = settings;
  }

  /**
   * Main diagnostic calculation method
   */
  public analyze(metrics: Partial<Diagnostic> & { prospectId: string }): Diagnostic {
    const diagnostic: Diagnostic = {
      id: `diag_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      prospectId: metrics.prospectId,
      calculatedAt: new Date().toISOString(),
      citasSemanales: metrics.citasSemanales || 0,
      ticketPromedio: metrics.ticketPromedio || 0,
      noShowPercentage: metrics.noShowPercentage || 0,
      slotsDisponibles: metrics.slotsDisponibles || 0,
      horasConsulta: metrics.horasConsulta || 0,
      sillaVaciaPercentage: 0,
      rentabilidadPercentage: 0,
      perdidaAnual: 0,
      perdidaNoShow: 0,
      costoOportunidad: 0,
      citasCompletadas: 0,
      ingresoActual: 0,
      ingresoPotencial: 0,
      severity: 'stable',
      severityScore: 0,
      diagnosticText: '',
      recommendations: []
    };

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

  private calculateMetrics(diagnostic: Diagnostic): void {
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
  }

  private calculateSeverity(diagnostic: Diagnostic): void {
    const perdidaPercentage = diagnostic.ingresoPotencial > 0
      ? (diagnostic.perdidaAnual / diagnostic.ingresoPotencial) * 100
      : 0;
    
    const sillaVaciaFactor = diagnostic.sillaVaciaPercentage;
    const noShowFactor = diagnostic.noShowPercentage;

    diagnostic.severityScore = (
      perdidaPercentage * 0.5 +
      sillaVaciaFactor * 0.3 +
      noShowFactor * 0.2
    );

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
  }

  private generateDiagnosticText(diagnostic: Diagnostic): string {
    const { severity } = diagnostic;
    let report = '';

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

    report += '## 📊 ANÁLISIS DE HEMORRAGIA FINANCIERA\n\n';
    report += `**Pérdida Anual Total**: ${this.formatCurrency(diagnostic.perdidaAnual)}\n`;
    report += `- Pérdida por No-Show: ${this.formatCurrency(diagnostic.perdidaNoShow)}\n`;
    report += `- Costo de Oportunidad (Sillas Vacías): ${this.formatCurrency(diagnostic.costoOportunidad)}\n\n`;

    report += '## 🏥 ANÁLISIS DE CAPACIDAD OPERATIVA\n\n';
    report += `**Silla Vacía**: ${diagnostic.sillaVaciaPercentage.toFixed(1)}%\n`;
    report += `**Rentabilidad Actual**: ${diagnostic.rentabilidadPercentage.toFixed(1)}%\n`;
    report += `**Tasa de No-Show**: ${diagnostic.noShowPercentage.toFixed(1)}%\n\n`;

    report += '## 💰 ANÁLISIS DE INGRESOS\n\n';
    report += `**Ingreso Actual Anual**: ${this.formatCurrency(diagnostic.ingresoActual)}\n`;
    report += `**Ingreso Potencial Anual**: ${this.formatCurrency(diagnostic.ingresoPotencial)}\n`;
    report += `**Brecha de Ingresos**: ${this.formatCurrency(diagnostic.perdidaAnual)}\n\n`;

    report += '## 🩺 INTERPRETACIÓN CLÍNICA\n\n';
    
    if (severity === 'critical') {
      report += 'La práctica presenta una **hemorragia crítica de recursos**. ';
      report += `Con ${diagnostic.sillaVaciaPercentage.toFixed(0)}% de capacidad sin utilizar y ${diagnostic.noShowPercentage.toFixed(0)}% de no-shows. `;
      report += 'Cada día sin intervención representa una hemorragia continua de ';
      report += `${this.formatCurrency(diagnostic.perdidaAnual / 365)} diarios.\n\n`;
    } else if (severity === 'severe') {
      report += 'La práctica sufre **sangrado severo de ingresos**. ';
      report += 'Tratamiento urgente puede recuperar ';
      report += `${this.formatCurrency(diagnostic.perdidaAnual)} anuales.\n\n`;
    } else if (severity === 'moderate') {
      report += 'La práctica presenta **hemorragia moderada pero persistente**. ';
      report += 'Intervención preventiva puede capturar ';
      report += `${this.formatCurrency(diagnostic.perdidaAnual)} adicionales anuales.\n\n`;
    } else {
      report += 'La práctica mantiene **operación saludable**. ';
      report += 'Oportunidades de mejora incremental disponibles.\n\n';
    }

    return report;
  }

  private generateRecommendations(diagnostic: Diagnostic): Recommendation[] {
    const recommendations: Recommendation[] = [];
    const { severity } = diagnostic;

    if (severity === 'critical') {
      recommendations.push({
        priority: 'critical',
        title: 'Implementación Inmediata de Sistema de Confirmación',
        description: `Reducir no-shows del ${diagnostic.noShowPercentage.toFixed(0)}% al 5% mediante recordatorios automatizados`,
        impact: this.formatCurrency(diagnostic.perdidaNoShow * 0.75)
      });
      recommendations.push({
        priority: 'critical',
        title: 'Optimización de Agenda y Overbooking Estratégico',
        description: 'Eliminar sillas vacías mediante gestión predictiva de capacidad',
        impact: this.formatCurrency(diagnostic.costoOportunidad * 0.6)
      });
    }

    if (severity === 'severe') {
      recommendations.push({
        priority: 'high',
        title: 'Protocolo Anti-NoShow',
        description: 'Implementar confirmación 48h antes + recordatorio 24h antes',
        impact: this.formatCurrency(diagnostic.perdidaNoShow * 0.6)
      });
    }

    recommendations.push({
      priority: 'low',
      title: 'Dashboard de Métricas en Tiempo Real',
      description: 'Monitoreo continuo de KPIs operativos para detección temprana',
      impact: 'Prevención de hemorragias futuras'
    });

    return recommendations;
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: this.settings.monedaCodigo,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }
}

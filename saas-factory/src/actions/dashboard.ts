'use server'

import { createClient } from '@/lib/supabase/server'

export interface DashboardMetrics {
  totalProspects: number
  prospectsThisMonth: number
  prospectsChange: number

  pendingDecisions: number
  decisionsThisWeek: number
  decisionsChange: number

  totalRevenueLost: number
  averageRevenueLost: number
  revenueChange: number

  criticalCases: number
  severeCases: number
  moderateCases: number
  stableCases: number

  conversionRate: number
  conversionChange: number
}

export interface PipelineMetrics {
  agendaDetenida: number
  diagnosticoProceso: number
  tratamientoAplicado: number
  recuperacionExitosa: number
}

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string }

export async function getDashboardMetrics(): Promise<ActionResult<DashboardMetrics>> {
  try {
    const supabase = await createClient()

    // Get prospects count
    const { count: totalProspects } = await supabase
      .from('prospects')
      .select('*', { count: 'exact', head: true })

    // Get this month's prospects
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { count: prospectsThisMonth } = await supabase
      .from('prospects')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth.toISOString())

    // Get pending decisions
    const { count: pendingDecisions } = await supabase
      .from('decisions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'PENDING')

    // Get severity counts
    const { data: severityData } = await supabase
      .from('prospects')
      .select('diagnostic_severity')

    const severityCounts = {
      critical: 0,
      severe: 0,
      moderate: 0,
      stable: 0
    }

    severityData?.forEach(row => {
      const severity = row.diagnostic_severity as keyof typeof severityCounts
      if (severity && severityCounts[severity] !== undefined) {
        severityCounts[severity]++
      }
    })

    // Get total revenue lost from diagnostics
    const { data: revenueData } = await supabase
      .from('prospects')
      .select('diagnostic_perdida_anual')

    let totalRevenueLost = 0
    let count = 0
    revenueData?.forEach(row => {
      if (row.diagnostic_perdida_anual) {
        totalRevenueLost += row.diagnostic_perdida_anual
        count++
      }
    })

    const averageRevenueLost = count > 0 ? totalRevenueLost / count : 0

    // Get conversion rate (recuperacion_exitosa / total)
    const { count: convertedCount } = await supabase
      .from('prospects')
      .select('*', { count: 'exact', head: true })
      .eq('stage', 'recuperacion_exitosa')

    const conversionRate = totalProspects && totalProspects > 0
      ? ((convertedCount || 0) / totalProspects) * 100
      : 0

    const metrics: DashboardMetrics = {
      totalProspects: totalProspects || 0,
      prospectsThisMonth: prospectsThisMonth || 0,
      prospectsChange: 12, // Placeholder - would need historical data

      pendingDecisions: pendingDecisions || 0,
      decisionsThisWeek: 5, // Placeholder
      decisionsChange: -8, // Placeholder

      totalRevenueLost,
      averageRevenueLost,
      revenueChange: -15, // Placeholder

      criticalCases: severityCounts.critical,
      severeCases: severityCounts.severe,
      moderateCases: severityCounts.moderate,
      stableCases: severityCounts.stable,

      conversionRate,
      conversionChange: 5 // Placeholder
    }

    return { ok: true, data: metrics }
  } catch (err) {
    console.error('Error fetching dashboard metrics:', err)
    return { ok: false, error: 'Error al cargar métricas del dashboard' }
  }
}

export async function getPipelineMetrics(): Promise<ActionResult<PipelineMetrics>> {
  try {
    const supabase = await createClient()

    const stages = ['agenda_detenida', 'diagnostico_proceso', 'tratamiento_aplicado', 'recuperacion_exitosa']
    const counts: Record<string, number> = {}

    for (const stage of stages) {
      const { count } = await supabase
        .from('prospects')
        .select('*', { count: 'exact', head: true })
        .eq('stage', stage)

      counts[stage] = count || 0
    }

    return {
      ok: true,
      data: {
        agendaDetenida: counts['agenda_detenida'],
        diagnosticoProceso: counts['diagnostico_proceso'],
        tratamientoAplicado: counts['tratamiento_aplicado'],
        recuperacionExitosa: counts['recuperacion_exitosa']
      }
    }
  } catch (err) {
    console.error('Error fetching pipeline metrics:', err)
    return { ok: false, error: 'Error al cargar métricas del pipeline' }
  }
}

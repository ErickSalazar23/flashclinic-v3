'use server'

import { createClient } from '@/lib/supabase/server'

export interface AppointmentsMetrics {
  // Today's Operations
  citasHoy: number
  citasPendientesConfirmacion: number
  citasConfirmadas: number
  citasCanceladas: number

  // Risk Analysis
  citasEnRiesgo: number // pending + within 24h
  tasaNoShow: number    // historical no_show rate (0-100%)

  // Financial Impact (assuming $50 average ticket)
  hemorragiaHoy: number         // $ lost from cancelled/no-show today
  hemorragiaMes: number         // $ lost this month
  dineroRecuperado: number      // $ saved by confirmations today
  dineroEnRiesgo: number        // $ at risk (pending)

  // Weekly Recovery Metrics (PALANCA 2)
  weeklyRecovery: {
    citasRecuperadas: number          // Confirmed this week (was pending)
    dineroRecuperado: number          // $ saved using no-show baseline
    tasaRecuperacion: number          // % of pending that confirmed
    comparisonVsLastWeek: number      // % difference vs last week (-100 to +100)
    trendDirection: 'up' | 'down' | 'stable'
  }

  // Recent Recovery Events (for feed)
  recentRecoveries: Array<{
    id: string
    patientName: string               // "Juan P." (anonymized)
    appointmentDate: string           // "Mañana 10:00am"
    recoveredAt: string               // ISO timestamp
  }>

  // System Activity (placeholder, for future enhancement)
  systemActions: Array<{
    id: string
    description: string       // "Sistema envió confirmación a Juan Pérez"
    timestamp: string
  }>
}

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string }

const AVERAGE_TICKET = 50 // Assume $50 per appointment (configurable later)

// ============ WEEKLY RECOVERY METRICS (PALANCA 2) ============

async function getWeeklyRecoveryMetrics(
  supabase: any,
  userId: string,
  tasaNoShow: number
) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const weekAgo = new Date(today)
  weekAgo.setDate(weekAgo.getDate() - 7)
  const twoWeeksAgo = new Date(today)
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)

  // Get confirmations this week (pending → confirmed)
  const { data: thisWeekChanges } = await supabase
    .from('appointment_changes')
    .select('id, appointment_id, created_at')
    .eq('user_id', userId)
    .eq('is_system_recovery', true)
    .gte('created_at', weekAgo.toISOString())
    .lt('created_at', today.toISOString())

  const citasRecuperadas = thisWeekChanges?.length || 0

  // Calculate $ saved using no-show baseline
  const dineroRecuperado = Math.round(
    citasRecuperadas * (tasaNoShow / 100) * AVERAGE_TICKET
  )

  // Get last week's count for comparison
  const { data: lastWeekChanges } = await supabase
    .from('appointment_changes')
    .select('id')
    .eq('user_id', userId)
    .eq('is_system_recovery', true)
    .gte('created_at', twoWeeksAgo.toISOString())
    .lt('created_at', weekAgo.toISOString())

  const lastWeekCount = lastWeekChanges?.length || 1 // Avoid division by zero
  const comparisonVsLastWeek = Math.round(
    ((citasRecuperadas - lastWeekCount) / lastWeekCount) * 100
  )

  const trendDirection: 'up' | 'down' | 'stable' =
    comparisonVsLastWeek > 5 ? 'up' :
    comparisonVsLastWeek < -5 ? 'down' :
    'stable'

  return {
    citasRecuperadas,
    dineroRecuperado,
    tasaRecuperacion: citasRecuperadas > 0 ? 100 : 0,
    comparisonVsLastWeek,
    trendDirection
  }
}

// ============ RECENT RECOVERY EVENTS FEED ============

async function getRecentRecoveries(supabase: any, userId: string) {
  const { data: changes } = await supabase
    .from('appointment_changes')
    .select(`
      id,
      created_at,
      appointment_id,
      appointments (
        appointment_date,
        start_time,
        patients (name)
      )
    `)
    .eq('user_id', userId)
    .eq('is_system_recovery', true)
    .order('created_at', { ascending: false })
    .limit(5)

  return (changes || []).map((change: any) => {
    const appointment = change.appointments
    const patient = appointment?.patients
    const patientName = patient?.name || 'Paciente'

    // Anonymize: "Juan P."
    const nameParts = patientName.split(' ')
    const firstName = nameParts[0]
    const lastInitial = nameParts[1]?.charAt(0) || ''
    const displayName = `${firstName} ${lastInitial}.`

    // Format date: "Mañana 10:00am" or "Lunes 15:00"
    const appointmentDate = new Date(appointment.appointment_date)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)

    const isTomorrow = appointmentDate.getTime() === tomorrow.getTime()
    const dateDisplay = isTomorrow
      ? `Mañana ${appointment.start_time}`
      : appointmentDate.toLocaleDateString('es-ES', { weekday: 'long' }) + ' ' + appointment.start_time

    return {
      id: change.id,
      patientName: displayName,
      appointmentDate: dateDisplay,
      recoveredAt: change.created_at
    }
  })
}

export async function getAppointmentsMetrics(): Promise<ActionResult<AppointmentsMetrics>> {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        ok: false,
        error: 'No autenticado. Por favor inicia sesión.',
      }
    }

    // Get today's date range
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrowStart = new Date(today)
    tomorrowStart.setDate(tomorrowStart.getDate() + 1)

    const todayString = today.toISOString().split('T')[0]
    const tomorrowString = tomorrowStart.toISOString().split('T')[0]

    // Get this month's date range
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    // ============ TODAY'S APPOINTMENTS ============

    // Get all appointments for today
    const { data: todayAppointments, error: todayError } = await supabase
      .from('appointments')
      .select('id, status, appointment_date')
      .eq('user_id', user.id)
      .eq('appointment_date', todayString)

    if (todayError) throw new Error(`Failed to fetch today's appointments: ${todayError.message}`)

    const citasHoy = todayAppointments?.length || 0
    const citasConfirmadas = todayAppointments?.filter(a => a.status === 'confirmed').length || 0
    const citasCanceladas = todayAppointments?.filter(a => a.status === 'cancelled').length || 0
    const citasPendientesConfirmacion =
      todayAppointments?.filter(a => a.status === 'pending').length || 0

    // ============ APPOINTMENTS AT RISK (within 24h) ============

    const { data: riskAppointments, error: riskError } = await supabase
      .from('appointments')
      .select('id, status, appointment_date')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .gte('appointment_date', todayString)
      .lt('appointment_date', tomorrowString)

    if (riskError) throw new Error(`Failed to fetch risk appointments: ${riskError.message}`)

    const citasEnRiesgo = riskAppointments?.length || 0

    // ============ HISTORICAL NO-SHOW RATE ============

    // Get all past appointments (completed + no_show)
    const pastDate = new Date(today)
    pastDate.setDate(pastDate.getDate() - 1)
    const pastDateString = pastDate.toISOString().split('T')[0]

    const { data: pastAppointments, error: pastError } = await supabase
      .from('appointments')
      .select('id, status')
      .eq('user_id', user.id)
      .lt('appointment_date', todayString)

    if (pastError) throw new Error(`Failed to fetch past appointments: ${pastError.message}`)

    const totalPastAppointments = pastAppointments?.length || 1 // Avoid division by zero
    const noShowCount = pastAppointments?.filter(a => a.status === 'no_show').length || 0
    const tasaNoShow =
      totalPastAppointments > 0 ? Math.round((noShowCount / totalPastAppointments) * 100) : 0

    // ============ FINANCIAL IMPACT - TODAY ============

    const hemorragiaHoy = (citasCanceladas + todayAppointments?.filter(a => a.status === 'no_show').length || 0) * AVERAGE_TICKET
    const dineroEnRiesgo = citasPendientesConfirmacion * AVERAGE_TICKET

    // ============ FINANCIAL IMPACT - THIS MONTH ============

    const { data: monthAppointments, error: monthError } = await supabase
      .from('appointments')
      .select('id, status, appointment_date')
      .eq('user_id', user.id)
      .gte('appointment_date', startOfMonth.toISOString().split('T')[0])
      .lt('appointment_date', tomorrowString)

    if (monthError) throw new Error(`Failed to fetch month appointments: ${monthError.message}`)

    const hemorragiaMes =
      (monthAppointments?.filter(a => a.status === 'cancelled' || a.status === 'no_show').length || 0) * AVERAGE_TICKET

    // Confirmed appointments = money recovered
    const dineroRecuperado = (citasConfirmadas) * AVERAGE_TICKET

    // ============ WEEKLY RECOVERY METRICS (PALANCA 2) ============

    const weeklyRecovery = await getWeeklyRecoveryMetrics(supabase, user.id, tasaNoShow)

    // ============ RECENT RECOVERY EVENTS ============

    const recentRecoveries = await getRecentRecoveries(supabase, user.id)

    // ============ SYSTEM ACTIONS (placeholder, will populate in Phase 4) ============

    // For now, return empty array. In Phase 4, this will query the prescriptions table
    const systemActions: Array<{ id: string; description: string; timestamp: string }> = []

    return {
      ok: true,
      data: {
        citasHoy,
        citasPendientesConfirmacion,
        citasConfirmadas,
        citasCanceladas,
        citasEnRiesgo,
        tasaNoShow,
        hemorragiaHoy,
        hemorragiaMes,
        dineroRecuperado,
        dineroEnRiesgo,
        weeklyRecovery,
        recentRecoveries,
        systemActions
      }
    }
  } catch (error) {
    console.error('Error calculating appointments metrics:', error)
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Failed to calculate metrics'
    }
  }
}

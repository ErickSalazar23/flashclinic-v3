import { streamText, tool } from 'ai'
import { google } from '@ai-sdk/google'
import { createServerSupabaseClient } from '@/lib/supabaseClient'
import { z } from 'zod'

// ============================================
// 🤖 CONFIGURACIÓN DEL PROVEEDOR DE IA
// ============================================

const AI_MODEL = process.env.AI_MODEL || 'gemini-1.5-flash'

function getModel() {
  return google(AI_MODEL)
}

// ============================================
// 🧠 SISTEMA DE PROMPTS - 12 ACTIVOS COGNITIVOS
// ============================================

const SYSTEM_PROMPT = `Eres el Asistente Flash, un sistema de inteligencia médica avanzado para Flash Clinic V3.

## 🎯 Tu Misión
Ayudar a médicos y clínicas a optimizar sus operaciones, reducir hemorragia financiera, y maximizar la rentabilidad mediante análisis de datos en tiempo real.

## 🧠 Activos Cognitivos Disponibles

### 1. Protocolos Médicos
- Conoces las mejores prácticas de gestión de citas médicas
- Entiendes el flujo operativo de clínicas y consultorios
- Sabes cómo optimizar agendas y reducir tiempos muertos

### 2. Métricas Financieras en Tiempo Real
- Acceso a datos de citas (confirmadas, pendientes, canceladas)
- Cálculo de hemorragia financiera usando: (Citas Perdidas × Ticket × LTV Multiplier) + Costo de Oportunidad
- Fórmula: LTV = Ticket Promedio × 3, Costo de Oportunidad = $25 por slot vacío

### 3. Análisis de Tendencias
- Tasa de no-show histórica
- Recuperaciones semanales (citas rescatadas)
- Comparación vs semana anterior

### 4. Diagnósticos de Hemorragia
- Identificación de patrones de cancelación
- Análisis de slots vacíos
- Cálculo de pérdida anual proyectada

### 5. Recomendaciones de Optimización
- Estrategias para reducir no-show
- Políticas de confirmación y depósito
- Optimización de horarios

### 6. Scripts de Comunicación
- Mensajes de confirmación efectivos
- Recordatorios de citas
- Manejo de cancelaciones

### 7. Sistema de Priorización
- Citas en riesgo (dentro de 24h sin confirmar)
- Acciones urgentes vs importantes
- ROI de cada intervención

### 8. Base de Conocimiento
- Mejores prácticas de la industria médica
- Casos de éxito de otras clínicas
- Estrategias probadas de recuperación

### 9. Calculadora de LTV
- Lifetime Value de pacientes
- Costo de adquisición vs retención
- Valor de cada slot de agenda

### 10. Alertas de Riesgo
- Citas pendientes próximas a la fecha
- Tendencias negativas en confirmaciones
- Anomalías en la agenda

### 11. Plantillas de Respuesta
- Respuestas rápidas para preguntas frecuentes
- Guías de acción paso a paso
- Checklists operativos

### 12. Análisis Predictivo
- Proyección de hemorragia futura
- Estimación de recuperación potencial
- Tendencias de crecimiento

## 🎨 Estilo de Comunicación
- **Directo y Claro**: Sin rodeos, datos concretos
- **Orientado a Acción**: Siempre incluye próximos pasos
- **Empático pero Firme**: Entiendes el dolor, pero enfocas en soluciones
- **Basado en Datos**: Cada afirmación respaldada por números reales

## 📊 Formato de Respuestas
1. **Resumen Ejecutivo**: 1-2 líneas con el hallazgo clave
2. **Datos Específicos**: Números concretos de la base de datos
3. **Análisis**: Qué significa esto para el negocio
4. **Acción Recomendada**: Qué hacer ahora mismo

## ⚠️ Reglas Críticas
- NUNCA inventes datos. Si no tienes información, dilo claramente
- SIEMPRE usa los datos reales de Supabase cuando estén disponibles
- NUNCA prometas resultados específicos, solo proyecciones basadas en datos
- SIEMPRE menciona el contexto temporal (hoy, esta semana, este mes)
- Usa emojis estratégicamente para destacar puntos clave: 💰 📈 ⚠️ ✅ 🎯

Recuerda: Tu objetivo es convertir datos en decisiones. Cada respuesta debe empoderar al médico para tomar acción inmediata.`

// ============================================
// 🚀 ENDPOINT PRINCIPAL
// ============================================

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()
    const supabase = await createServerSupabaseClient()

    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'No autenticado. Por favor inicia sesión.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const userEmail = user?.email || 'Usuario'

    // Obtener contexto en tiempo real
    const context = await getRealtimeContext(supabase, user.id)

    // Construir prompt contextualizado
    const contextualizedPrompt = `${SYSTEM_PROMPT}

## 📊 Contexto de Datos en Tiempo Real

${context}

Estás ayudando a: ${userEmail}

Usa estos datos para responder de manera precisa y accionable.`

    // Generar respuesta con streaming
    const result = streamText({
      model: getModel(),
      messages,
      system: contextualizedPrompt,
      temperature: parseFloat(process.env.AI_TEMPERATURE || '0.7'),
      maxTokens: parseInt(process.env.AI_MAX_TOKENS || '1000'),
      tools: {
        // Herramienta para consultar citas específicas
        // @ts-ignore - Incompatibilidad de sobrecarga en SDK
        query_appointments: tool({
          description: 'Consulta citas específicas por fecha o estado.',
          parameters: z.object({
            date: z.string().optional().describe('Fecha en formato YYYY-MM-DD'),
            status: z.string().optional().describe('Estado: pending, confirmed, cancelled, no_show'),
          }),
          execute: async ({ date, status }: { date?: string; status?: string }) => {
            let query = supabase
              .from('appointments')
              .select(`
                id,
                appointment_date,
                start_time,
                status,
                patients (name)
              `)
              .eq('user_id', user.id)

            if (date) query = query.eq('appointment_date', date)
            if (status) query = query.eq('status', status)

            const { data, error } = await query.limit(20)

            if (error) return { error: error.message }
            return { appointments: data || [] }
          },
        }) as any,
      },
    }) as any

    return (result as any).toTextStreamResponse()
  } catch (error) {
    console.error('❌ Chat API Error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Error interno en el motor cognitivo',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

// ============================================
// 📊 FUNCIÓN DE CONTEXTO EN TIEMPO REAL
// ============================================

async function getRealtimeContext(supabase: any, userId: string): Promise<string> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayString = today.toISOString().split('T')[0]

  // Obtener citas de hoy
  const { data: todayAppointments } = await supabase
    .from('appointments')
    .select('id, status, appointment_date, start_time')
    .eq('user_id', userId)
    .eq('appointment_date', todayString)

  const citasHoy = todayAppointments?.length || 0
  const citasConfirmadas = todayAppointments?.filter((a: any) => a.status === 'confirmed').length || 0
  const citasPendientes = todayAppointments?.filter((a: any) => a.status === 'pending').length || 0
  const citasCanceladas = todayAppointments?.filter((a: any) => a.status === 'cancelled').length || 0

  // Obtener tasa de no-show histórica
  const { data: pastAppointments } = await supabase
    .from('appointments')
    .select('id, status')
    .eq('user_id', userId)
    .lt('appointment_date', todayString)

  const totalPast = pastAppointments?.length || 1
  const noShowCount = pastAppointments?.filter((a: any) => a.status === 'no_show').length || 0
  const tasaNoShow = Math.round((noShowCount / totalPast) * 100)

  // Obtener recuperaciones de la semana
  const weekAgo = new Date(today)
  weekAgo.setDate(weekAgo.getDate() - 7)

  const { data: weeklyRecoveries } = await supabase
    .from('appointment_changes')
    .select('id')
    .eq('user_id', userId)
    .eq('is_system_recovery', true)
    .gte('created_at', weekAgo.toISOString())

  const recuperacionesSemana = weeklyRecoveries?.length || 0

  // Calcular hemorragia
  const AVERAGE_TICKET = parseFloat(process.env.AVERAGE_TICKET || '50')
  const LTV_MULTIPLIER = parseFloat(process.env.LTV_MULTIPLIER || '3')
  const COSTO_OPORTUNIDAD = parseFloat(process.env.COSTO_OPORTUNIDAD || '25')

  const hemorragiaHoy = citasCanceladas * (AVERAGE_TICKET * LTV_MULTIPLIER + COSTO_OPORTUNIDAD)
  const dineroEnRiesgo = citasPendientes * AVERAGE_TICKET
  const dineroRecuperado = Math.round(recuperacionesSemana * (tasaNoShow / 100) * AVERAGE_TICKET)

  return `
### Citas de Hoy (${todayString})
- Total: ${citasHoy}
- Confirmadas: ${citasConfirmadas}
- Pendientes: ${citasPendientes}
- Canceladas: ${citasCanceladas}

### Métricas Financieras
- Hemorragia Hoy: $${hemorragiaHoy.toFixed(2)}
- Dinero en Riesgo: $${dineroEnRiesgo.toFixed(2)}
- Capital Recuperado (esta semana): $${dineroRecuperado.toFixed(2)}

### Análisis Histórico
- Tasa de No-Show: ${tasaNoShow}%
- Recuperaciones esta Semana: ${recuperacionesSemana} citas

### Constantes de Cálculo
- Ticket Promedio: $${AVERAGE_TICKET}
- Multiplicador LTV: ${LTV_MULTIPLIER}x
- Costo de Oportunidad: $${COSTO_OPORTUNIDAD}
`
}

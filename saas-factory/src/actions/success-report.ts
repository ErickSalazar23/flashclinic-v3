'use server'

import { createClient } from '@/lib/supabase/server'

export interface SuccessMetric {
  totalRecoveries: number;
  estimatedRevenueRecovered: number;
  recentRecoveries: {
    id: string;
    createdAt: string;
    oldStatus: string;
    newStatus: string;
    patientName?: string;
  }[];
}

export async function getSuccessReport(): Promise<{ ok: true; data: SuccessMetric } | { ok: false; error: string }> {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { ok: false, error: 'No autorizado' }

    // Fetch recovery count
    const { count, error: countError } = await supabase
      .from('appointment_changes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_system_recovery', true)

    if (countError) throw countError;

    // Fetch recent recoveries with patient names
    const { data: recent, error: recentError } = await supabase
      .from('appointment_changes')
      .select(`
        id,
        created_at,
        old_status,
        new_status,
        appointments (
          patients (
            name
          ),
          prospects (
            ticket_promedio
          )
        )
      `)
      .eq('user_id', user.id)
      .eq('is_system_recovery', true)
      .order('created_at', { ascending: false })
      .limit(5)

    if (recentError) throw recentError;

    // Calculate estimated revenue (simple logic for now)
    // We would need to sum the ticket_promedio of associated prospects
    let totalRevenue = 0;
    const { data: allRecoveries } = await supabase
      .from('appointment_changes')
      .select(`
        appointments (
          prospects (
            ticket_promedio
          )
        )
      `)
      .eq('user_id', user.id)
      .eq('is_system_recovery', true);

    allRecoveries?.forEach(r => {
      const ticket = (r.appointments as any)?.prospects?.ticket_promedio || 60; // Default or from prospect
      totalRevenue += ticket;
    });

    return {
      ok: true,
      data: {
        totalRecoveries: count || 0,
        estimatedRevenueRecovered: totalRevenue,
        recentRecoveries: (recent || []).map((r: any) => ({
          id: r.id,
          createdAt: r.created_at,
          oldStatus: r.old_status,
          newStatus: r.new_status,
          patientName: r.appointments?.patients?.name || 'Paciente'
        }))
      }
    }
  } catch (err: any) {
    console.error('Error in success report:', err)
    return { ok: false, error: err.message }
  }
}

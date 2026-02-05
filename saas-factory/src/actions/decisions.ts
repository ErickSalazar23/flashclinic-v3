'use server'

import { createClient } from '@/lib/supabase/server'
import { Decision, DecisionFilters, DecisionStatus } from '@/features/decisions/types'

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string }

export async function listDecisions(
  filters: DecisionFilters = {}
): Promise<ActionResult<Decision[]>> {
  try {
    const supabase = await createClient()

    let query = supabase
      .from('decisions')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.type) {
      query = query.eq('type', filters.type)
    }
    if (filters.priority) {
      query = query.eq('priority', filters.priority)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching decisions:', error)
      return { ok: false, error: error.message }
    }

    const decisions: Decision[] = (data || []).map(row => ({
      id: row.id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      type: row.type,
      status: row.status,
      priority: row.priority,
      title: row.title,
      description: row.description,
      prospectId: row.prospect_id,
      prospectName: row.prospect_name,
      dueDate: row.due_date,
      decidedAt: row.decided_at,
      decidedBy: row.decided_by,
      metadata: row.metadata
    }))

    return { ok: true, data: decisions }
  } catch (err) {
    console.error('Unexpected error:', err)
    return { ok: false, error: 'Error inesperado al cargar decisiones' }
  }
}

export async function updateDecisionStatus(
  id: string,
  status: DecisionStatus
): Promise<ActionResult<Decision>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    const { data, error } = await supabase
      .from('decisions')
      .update({
        status,
        decided_at: new Date().toISOString(),
        decided_by: user?.email || 'unknown',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating decision:', error)
      return { ok: false, error: error.message }
    }

    const decision: Decision = {
      id: data.id,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      type: data.type,
      status: data.status,
      priority: data.priority,
      title: data.title,
      description: data.description,
      prospectId: data.prospect_id,
      prospectName: data.prospect_name,
      dueDate: data.due_date,
      decidedAt: data.decided_at,
      decidedBy: data.decided_by,
      metadata: data.metadata
    }

    return { ok: true, data: decision }
  } catch (err) {
    console.error('Unexpected error:', err)
    return { ok: false, error: 'Error inesperado al actualizar decisión' }
  }
}

export async function createDecision(
  input: Omit<Decision, 'id' | 'createdAt' | 'updatedAt' | 'decidedAt' | 'decidedBy'>
): Promise<ActionResult<Decision>> {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { ok: false, error: 'No autorizado' }
    }

    const { data, error } = await supabase
      .from('decisions')
      .insert({
        user_id: user.id,
        type: input.type,
        status: input.status,
        priority: input.priority,
        title: input.title,
        description: input.description,
        prospect_id: input.prospectId,
        prospect_name: input.prospectName,
        due_date: input.dueDate,
        metadata: input.metadata
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating decision:', error)
      return { ok: false, error: error.message }
    }

    const decision: Decision = {
      id: data.id,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      type: data.type,
      status: data.status,
      priority: data.priority,
      title: data.title,
      description: data.description,
      prospectId: data.prospect_id,
      prospectName: data.prospect_name,
      dueDate: data.due_date,
      decidedAt: data.decided_at,
      decidedBy: data.decided_by,
      metadata: data.metadata
    }

    return { ok: true, data: decision }
  } catch (err) {
    console.error('Unexpected error:', err)
    return { ok: false, error: 'Error inesperado al crear decisión' }
  }
}

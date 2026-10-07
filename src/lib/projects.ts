import { supabase } from './supabase'
import type {
  MilestoneApproval,
  Payment,
  PaymentInput,
  Project,
  ProjectInput,
  ProjectStage,
  StageInput,
} from './types'

type Result<T> = { data: T | null; error: { message: string } | null }

function unwrap<T>(result: Result<T>, notFoundMessage = 'No se encontró el registro'): T {
  if (result.error) throw new Error(result.error.message)
  if (result.data === null) throw new Error(notFoundMessage)
  return result.data
}

async function unwrapList<T>(result: Result<T[]>): Promise<T[]> {
  if (result.error) throw new Error(result.error.message)
  return result.data ?? []
}

// ----------------------------------------------------------------------------
// Proyectos
// ----------------------------------------------------------------------------

/**
 * Lista proyectos. RLS define el alcance: el admin ve todos y el cliente solo
 * los suyos (mismo query para ambos).
 */
export async function listProjects(): Promise<Project[]> {
  const result = await supabase.from('projects').select('*').order('created_at', { ascending: false })
  return unwrapList(result)
}

export async function getProject(id: string): Promise<Project> {
  const result = await supabase.from('projects').select('*').eq('id', id).maybeSingle()
  return unwrap(result, 'Proyecto no encontrado')
}

export async function createProject(input: ProjectInput): Promise<Project> {
  const result = await supabase.from('projects').insert(input).select().single()
  return unwrap(result)
}

export async function updateProject(id: string, patch: Partial<ProjectInput>): Promise<Project> {
  const result = await supabase.from('projects').update(patch).eq('id', id).select().single()
  return unwrap(result)
}

export async function deleteProject(id: string): Promise<void> {
  const { error } = await supabase.from('projects').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

// ----------------------------------------------------------------------------
// Etapas (timeline)
// ----------------------------------------------------------------------------

export async function listStages(projectId: string): Promise<ProjectStage[]> {
  const result = await supabase
    .from('project_stages')
    .select('*')
    .eq('project_id', projectId)
    .order('position', { ascending: true })
  return unwrapList(result)
}

export async function createStage(projectId: string, input: StageInput): Promise<ProjectStage> {
  const result = await supabase
    .from('project_stages')
    .insert({ ...input, project_id: projectId })
    .select()
    .single()
  return unwrap(result)
}

export async function updateStage(id: string, patch: Partial<StageInput>): Promise<ProjectStage> {
  const result = await supabase.from('project_stages').update(patch).eq('id', id).select().single()
  return unwrap(result)
}

export async function deleteStage(id: string): Promise<void> {
  const { error } = await supabase.from('project_stages').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

/** Reordena las etapas: actualiza `position` en el orden dado. */
export async function reorderStages(orderedIds: string[]): Promise<void> {
  for (const [index, id] of orderedIds.entries()) {
    const { error } = await supabase.from('project_stages').update({ position: index }).eq('id', id)
    if (error) throw new Error(error.message)
  }
}

// ----------------------------------------------------------------------------
// Pagos
// ----------------------------------------------------------------------------

export async function listPayments(projectId: string): Promise<Payment[]> {
  const result = await supabase
    .from('payments')
    .select('*')
    .eq('project_id', projectId)
    .order('due_date', { ascending: true, nullsFirst: false })
  return unwrapList(result)
}

export async function listAllPayments(): Promise<Payment[]> {
  const result = await supabase.from('payments').select('*').order('created_at', { ascending: false })
  return unwrapList(result)
}

export async function createPayment(input: PaymentInput): Promise<Payment> {
  const result = await supabase.from('payments').insert(input).select().single()
  return unwrap(result)
}

export async function updatePayment(id: string, patch: Partial<PaymentInput>): Promise<Payment> {
  const result = await supabase.from('payments').update(patch).eq('id', id).select().single()
  return unwrap(result)
}

export async function deletePayment(id: string): Promise<void> {
  const { error } = await supabase.from('payments').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

// ----------------------------------------------------------------------------
// Aprobaciones de hitos
// ----------------------------------------------------------------------------

export async function listApprovals(projectId: string): Promise<MilestoneApproval[]> {
  const result = await supabase
    .from('milestone_approvals')
    .select('*')
    .eq('project_id', projectId)
  return unwrapList(result)
}

/** El cliente registra (o cambia) su decisión sobre una etapa en revisión. */
export async function decideMilestone(
  input: Pick<MilestoneApproval, 'stage_id' | 'project_id' | 'client_id' | 'decision' | 'comment'>,
): Promise<MilestoneApproval> {
  const result = await supabase
    .from('milestone_approvals')
    .upsert(input, { onConflict: 'stage_id' })
    .select()
    .single()
  return unwrap(result)
}

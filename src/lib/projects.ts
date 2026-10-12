import { supabase } from './supabase'
import { getBrief } from './briefs'
import { isValidEmail, normalizeEmail } from '../utils/email'
import type {
  MilestoneApproval,
  Project,
  ProjectBrief,
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

/** RT-02: valida la estructura del email del cliente (defensa en profundidad). */
function assertValidClientEmail(clientEmail: string): void {
  if (!isValidEmail(clientEmail)) {
    throw new Error('El email del cliente no es válido.')
  }
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

/**
 * Error tipado de "proyecto no encontrado": los callers ramifican por tipo
 * (`instanceof`), nunca comparando el mensaje.
 */
export class ProjectNotFoundError extends Error {
  constructor(message = 'Proyecto no encontrado') {
    super(message)
    this.name = 'ProjectNotFoundError'
  }
}

export async function getProject(id: string): Promise<Project> {
  const result = await supabase.from('projects').select('*').eq('id', id).maybeSingle()
  if (result.error) throw new Error(result.error.message)
  if (result.data === null) throw new ProjectNotFoundError()
  return result.data
}

export async function createProject(input: ProjectInput): Promise<Project> {
  // RT-02: normaliza a minúsculas y valida antes de escribir.
  const client_email = normalizeEmail(input.client_email)
  assertValidClientEmail(client_email)
  const result = await supabase.from('projects').insert({ ...input, client_email }).select().single()
  return unwrap(result)
}

export async function updateProject(id: string, patch: Partial<ProjectInput>): Promise<Project> {
  const cleanPatch = { ...patch }
  if (cleanPatch.client_email !== undefined) {
    cleanPatch.client_email = normalizeEmail(cleanPatch.client_email)
    assertValidClientEmail(cleanPatch.client_email)
  }
  const result = await supabase.from('projects').update(cleanPatch).eq('id', id).select().single()
  return unwrap(result)
}

export async function deleteProject(id: string): Promise<void> {
  const { error } = await supabase.from('projects').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

/** Agregado "detalle de proyecto": proyecto + etapas + aprobaciones + brief. */
export type ProjectDetail = {
  project: Project
  stages: ProjectStage[]
  approvals: MilestoneApproval[]
  brief: ProjectBrief | null
}

/**
 * Ensambla el detalle completo de un proyecto detrás de un único interface.
 * Las páginas de detalle (admin y cliente) lo consumen en vez de armar cada una
 * el `Promise.all` de cuatro consultas.
 */
export async function loadProjectDetail(id: string): Promise<ProjectDetail> {
  const [project, stages, approvals, brief] = await Promise.all([
    getProject(id),
    listStages(id),
    listApprovals(id),
    getBrief(id),
  ])
  return { project, stages, approvals, brief }
}

// ----------------------------------------------------------------------------
// Etapas (timeline)
// ----------------------------------------------------------------------------

/**
 * Progreso del proyecto: etapas completadas sobre el total visible.
 * Lógica pura del panel del cliente, sin I/O.
 */
export function computeProgress(stages: ProjectStage[]): { done: number; total: number } {
  const done = stages.filter((stage) => stage.status === 'completada').length
  return { done, total: stages.length }
}

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

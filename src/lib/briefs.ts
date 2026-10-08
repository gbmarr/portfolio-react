import { supabase } from './supabase'
import type { EstimateTierId } from '../data/estimate'
import { computeBriefStatus, getBriefTemplate } from '../data/briefTemplates'
import type { BriefStatus, ProjectBrief } from './types'

type Result<T> = { data: T | null; error: { message: string } | null }

function throwOnError<T>(result: Result<T>): T | null {
  if (result.error) throw new Error(result.error.message)
  return result.data
}

async function unwrapList<T>(result: Result<T[]>): Promise<T[]> {
  if (result.error) throw new Error(result.error.message)
  return result.data ?? []
}

/** Compara servicios/extras ignorando el orden de extra_ids. */
function sameSetup(current: ProjectBrief, serviceType: EstimateTierId, extraIds: string[]): boolean {
  const sortedCurrent = [...current.extra_ids].sort().join('|')
  const sortedNext = [...extraIds].sort().join('|')
  return current.service_type === serviceType && sortedCurrent === sortedNext
}

// ----------------------------------------------------------------------------
// Brief del proyecto ("¿Qué vamos a necesitar?")
// ----------------------------------------------------------------------------

/** Devuelve el brief del proyecto o null si el admin no lo configuró. */
export async function getBrief(projectId: string): Promise<ProjectBrief | null> {
  const result = await supabase
    .from('project_briefs')
    .select('*')
    .eq('project_id', projectId)
    .maybeSingle()
  return throwOnError(result)
}

/**
 * Crea el brief si no existe; si existe y cambió servicio/extras, lo actualiza
 * y resetea las respuestas del cliente (vuelve a pendiente).
 */
export async function upsertBrief(
  projectId: string,
  serviceType: EstimateTierId,
  extraIds: string[],
): Promise<ProjectBrief> {
  const current = await getBrief(projectId)

  if (!current) {
    const created = await supabase
      .from('project_briefs')
      .insert({
        project_id: projectId,
        service_type: serviceType,
        extra_ids: extraIds,
        answers: {},
        status: 'pendiente',
      })
      .select()
      .single()
    if (created.error) throw new Error(created.error.message)
    return created.data as ProjectBrief
  }

  if (sameSetup(current, serviceType, extraIds)) {
    return current
  }

  const updated = await supabase
    .from('project_briefs')
    .update({ service_type: serviceType, extra_ids: extraIds, answers: {}, status: 'pendiente' })
    .eq('project_id', projectId)
    .select()
    .single()
  if (updated.error) throw new Error(updated.error.message)
  return updated.data as ProjectBrief
}

/** Guarda las respuestas del cliente y recalcula el estado (autocalculado). */
export async function updateBriefAnswers(
  projectId: string,
  answers: Record<string, string>,
): Promise<ProjectBrief> {
  const current = await getBrief(projectId)
  if (!current) throw new Error('Brief no encontrado')

  const template = getBriefTemplate(current.service_type)
  const status: BriefStatus = computeBriefStatus(template, current.extra_ids, answers)

  const updated = await supabase
    .from('project_briefs')
    .update({ answers, status })
    .eq('project_id', projectId)
    .select()
    .single()
  if (updated.error) throw new Error(updated.error.message)
  return updated.data as ProjectBrief
}

/** Todos los briefs (para el resumen del dashboard admin). */
export async function listBriefs(): Promise<ProjectBrief[]> {
  const result = await supabase.from('project_briefs').select('*').order('updated_at', { ascending: false })
  return unwrapList(result)
}
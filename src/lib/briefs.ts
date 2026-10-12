import { supabase } from './supabase'
import { unwrap, unwrapList, unwrapMaybe } from './supabase-result'
import type { EstimateTierId } from '../data/estimate'
import type { BriefAnswers, ProjectBrief } from './types'

/** Compara servicios/extras ignorando el orden de extra_ids. */
function sameSetup(
  current: ProjectBrief,
  serviceType: EstimateTierId,
  extraIds: string[]
): boolean {
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
  return unwrapMaybe(result)
}

/**
 * Crea el brief si no existe; si existe y cambió servicio/extras, lo actualiza
 * y resetea las respuestas del cliente (vuelve a pendiente).
 */
export async function upsertBrief(
  projectId: string,
  serviceType: EstimateTierId,
  extraIds: string[]
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
    return unwrap(created)
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
  return unwrap(updated)
}

/**
 * Guarda las respuestas del cliente. El `status` lo deriva la base
 * (compute_brief_status, SEC-006): el cliente ya no lo envía.
 */
export async function updateBriefAnswers(
  projectId: string,
  answers: BriefAnswers
): Promise<ProjectBrief> {
  const current = await getBrief(projectId)
  if (!current) throw new Error('Brief no encontrado')

  const updated = await supabase
    .from('project_briefs')
    .update({ answers })
    .eq('project_id', projectId)
    .select()
    .single()
  return unwrap(updated)
}

/** Todos los briefs (para el resumen del dashboard admin). */
export async function listBriefs(): Promise<ProjectBrief[]> {
  const result = await supabase
    .from('project_briefs')
    .select('*')
    .order('updated_at', { ascending: false })
  return unwrapList(result)
}

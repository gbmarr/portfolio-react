import { supabase } from './supabase'
import { throwIfError, unwrap, unwrapList, unwrapMaybe } from './supabase-result'
import type { ProjectPreview, ProjectPreviewWithUrl } from './types'

export const PREVIEW_BUCKET = 'project-previews'
export const MAX_PREVIEW_BYTES = 5 * 1024 * 1024
export const PREVIEW_URL_TTL_SECONDS = 60 * 60
export const ALLOWED_PREVIEW_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
] as const

export type PreviewValidation =
  { ok: true; mime: (typeof ALLOWED_PREVIEW_MIME_TYPES)[number] } | { ok: false; message: string }

const EXTENSION_BY_MIME: Record<(typeof ALLOWED_PREVIEW_MIME_TYPES)[number], string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
}

/** Valida tipo y tamaño antes de tocar Storage. */
export function validatePreviewFile(file: Pick<File, 'size' | 'type'>): PreviewValidation {
  if (file.size <= 0) {
    return { ok: false, message: 'El archivo está vacío.' }
  }
  if (file.size > MAX_PREVIEW_BYTES) {
    return { ok: false, message: 'La imagen supera el límite de 5 MB.' }
  }
  if (!ALLOWED_PREVIEW_MIME_TYPES.includes(file.type as never)) {
    return { ok: false, message: 'Formato no permitido. Usá JPG, PNG, WebP o AVIF.' }
  }
  return { ok: true, mime: file.type as (typeof ALLOWED_PREVIEW_MIME_TYPES)[number] }
}

function randomId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

/** Path estable y no adivinable: {project_id}/{uuid}.{ext}. */
export function buildPreviewPath(projectId: string, mime: string, id = randomId()): string {
  const extension = EXTENSION_BY_MIME[mime as keyof typeof EXTENSION_BY_MIME] ?? 'jpg'
  return `${projectId}/${id}.${extension}`
}

/**
 * Normaliza y valida el enlace externo de preview.
 * Acepta `dominio.com/preview` (agrega https://) y rechaza esquemas peligrosos.
 */
export function normalizePreviewUrl(raw: string): string | null {
  const trimmed = raw.trim()
  if (!trimmed) return null

  const candidate = /^[a-z][a-z\d+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`
  let parsed: URL
  try {
    parsed = new URL(candidate)
  } catch {
    throw new Error('El enlace de preview no es válido.')
  }

  if (parsed.protocol !== 'https:') {
    throw new Error('El enlace de preview debe usar HTTPS.')
  }
  if (!parsed.hostname) {
    throw new Error('El enlace de preview no es válido.')
  }
  return parsed.toString()
}

/** Normaliza la etiqueta visible; vacía -> null; máximo 80 caracteres. */
export function normalizePreviewLabel(raw: string): string | null {
  const trimmed = raw.trim()
  if (!trimmed) return null
  if (trimmed.length > 80) {
    throw new Error('La etiqueta del preview no puede superar los 80 caracteres.')
  }
  return trimmed
}

/** Lista capturas del proyecto con signed URLs (1 hora). */
export async function listProjectPreviews(projectId: string): Promise<ProjectPreviewWithUrl[]> {
  const result = await supabase
    .from('project_previews')
    .select('*')
    .eq('project_id', projectId)
    .order('position', { ascending: true })
    .order('created_at', { ascending: true })

  const previews = unwrapList<ProjectPreview>(result)

  return Promise.all(
    previews.map(async (preview) => {
      const signed = await supabase.storage
        .from(PREVIEW_BUCKET)
        .createSignedUrl(preview.storage_path, PREVIEW_URL_TTL_SECONDS)

      return {
        ...preview,
        url: signed.error ? null : (signed.data?.signedUrl ?? null),
      }
    })
  )
}

export type UploadPreviewInput = {
  caption?: string | null
  stage_id?: string | null
  client_visible?: boolean
}

/**
 * Sube la imagen y crea la fila. Si falla el insert, elimina el objeto subido
 * para no dejar huérfanos en Storage.
 */
export async function uploadProjectPreview(
  projectId: string,
  file: File,
  input: UploadPreviewInput = {}
): Promise<ProjectPreview> {
  const validation = validatePreviewFile(file)
  if (!validation.ok) {
    throw new Error(validation.message)
  }

  const storagePath = buildPreviewPath(projectId, validation.mime)
  const upload = await supabase.storage.from(PREVIEW_BUCKET).upload(storagePath, file, {
    contentType: validation.mime,
    upsert: false,
  })
  if (upload.error) throw new Error(upload.error.message)

  try {
    const lastResult = await supabase
      .from('project_previews')
      .select('position')
      .eq('project_id', projectId)
      .order('position', { ascending: false })
      .limit(1)
      .maybeSingle()

    const last = unwrapMaybe<{ position: number }>(lastResult)
    const position = (last?.position ?? -1) + 1

    const insert = await supabase
      .from('project_previews')
      .insert({
        project_id: projectId,
        stage_id: input.stage_id ?? null,
        storage_path: storagePath,
        caption: input.caption?.trim() || null,
        position,
        client_visible: input.client_visible ?? true,
      })
      .select()
      .single()

    return unwrap<ProjectPreview>(insert)
  } catch (error) {
    // Rollback best-effort: si falla el insert, no dejamos el archivo huérfano.
    await supabase.storage.from(PREVIEW_BUCKET).remove([storagePath])
    throw error
  }
}

export type ProjectPreviewPatch = Partial<
  Pick<ProjectPreview, 'caption' | 'client_visible' | 'stage_id' | 'position'>
>

export async function updateProjectPreview(
  id: string,
  patch: ProjectPreviewPatch
): Promise<ProjectPreview> {
  const result = await supabase
    .from('project_previews')
    .update(patch)
    .eq('id', id)
    .select()
    .single()
  return unwrap<ProjectPreview>(result)
}

/** Elimina el objeto de Storage y después la fila. */
export async function deleteProjectPreview(
  preview: Pick<ProjectPreview, 'id' | 'storage_path'>
): Promise<void> {
  const remove = await supabase.storage.from(PREVIEW_BUCKET).remove([preview.storage_path])
  throwIfError(remove)

  const result = await supabase.from('project_previews').delete().eq('id', preview.id)
  throwIfError(result)
}

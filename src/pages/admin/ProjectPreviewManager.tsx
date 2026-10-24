import { useRef, useState, type FormEvent } from 'react'
import { Badge } from '../../components/ui/Badge'
import { FormField } from '../../components/ui/FormField'
import { SelectField } from '../../components/ui/SelectField'
import { panelCopy } from '../../data/panel'
import { updateProject } from '../../lib/projects'
import {
  deleteProjectPreview,
  normalizePreviewLabel,
  normalizePreviewUrl,
  updateProjectPreview,
  uploadProjectPreview,
  validatePreviewFile,
} from '../../lib/previews'
import type { Project, ProjectPreviewWithUrl, ProjectStage } from '../../lib/types'

export type ProjectPreviewManagerProps = {
  project: Project
  stages: ProjectStage[]
  previews: ProjectPreviewWithUrl[]
  onChanged: () => Promise<void> | void
}

const copy = panelCopy.admin.preview

/** Sección admin para publicar el enlace externo y las capturas del avance. */
export function ProjectPreviewManager({
  project,
  stages,
  previews,
  onChanged,
}: ProjectPreviewManagerProps) {
  const [previewUrl, setPreviewUrl] = useState(project.preview_url ?? '')
  const [previewLabel, setPreviewLabel] = useState(project.preview_label ?? '')
  const [savingLink, setSavingLink] = useState(false)
  const [linkMessage, setLinkMessage] = useState<string | null>(null)
  const [linkError, setLinkError] = useState<string | null>(null)

  const [file, setFile] = useState<File | null>(null)
  const [caption, setCaption] = useState('')
  const [stageId, setStageId] = useState('')
  const [clientVisible, setClientVisible] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadMessage, setUploadMessage] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [busyId, setBusyId] = useState<string | null>(null)
  const [galleryError, setGalleryError] = useState<string | null>(null)

  const stageOptions = [
    { value: '', label: copy.noStage },
    ...stages.map((stage) => ({ value: stage.id, label: `Asociar a ${stage.name}` })),
  ]

  async function handleSaveLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLinkMessage(null)
    setLinkError(null)

    let url: string | null
    let label: string | null
    try {
      url = normalizePreviewUrl(previewUrl)
      label = normalizePreviewLabel(previewLabel)
    } catch (error) {
      setLinkError(error instanceof Error ? error.message : copy.error)
      return
    }

    setSavingLink(true)
    try {
      await updateProject(project.id, { preview_url: url, preview_label: label })
      setPreviewUrl(url ?? '')
      setPreviewLabel(label ?? '')
      setLinkMessage(copy.savedLink)
      await onChanged()
    } catch (error) {
      setLinkError(error instanceof Error ? error.message : copy.error)
    } finally {
      setSavingLink(false)
    }
  }

  async function handleRemoveLink() {
    setSavingLink(true)
    setLinkMessage(null)
    setLinkError(null)
    try {
      await updateProject(project.id, { preview_url: null, preview_label: null })
      setPreviewUrl('')
      setPreviewLabel('')
      setLinkMessage(copy.savedLink)
      await onChanged()
    } catch (error) {
      setLinkError(error instanceof Error ? error.message : copy.error)
    } finally {
      setSavingLink(false)
    }
  }

  async function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setUploadMessage(null)
    setUploadError(null)

    if (!file) {
      setUploadError('Elegí una imagen para subir.')
      return
    }
    const validation = validatePreviewFile(file)
    if (!validation.ok) {
      setUploadError(validation.message)
      return
    }

    setUploading(true)
    try {
      await uploadProjectPreview(project.id, file, {
        caption,
        stage_id: stageId || null,
        client_visible: clientVisible,
      })
      setFile(null)
      setCaption('')
      setStageId('')
      setClientVisible(true)
      if (fileInputRef.current) fileInputRef.current.value = ''
      setUploadMessage(copy.uploaded)
      await onChanged()
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : copy.error)
    } finally {
      setUploading(false)
    }
  }

  async function handleToggleVisibility(preview: ProjectPreviewWithUrl) {
    setBusyId(preview.id)
    setGalleryError(null)
    try {
      await updateProjectPreview(preview.id, { client_visible: !preview.client_visible })
      await onChanged()
    } catch {
      setGalleryError(copy.error)
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete(preview: ProjectPreviewWithUrl) {
    setBusyId(preview.id)
    setGalleryError(null)
    try {
      await deleteProjectPreview(preview)
      await onChanged()
    } catch {
      setGalleryError(copy.error)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <section
      aria-label={copy.title}
      className="space-y-6 rounded-xl border border-border bg-background/60 p-5"
    >
      <div>
        <h2 className="text-sm font-semibold text-text">{copy.title}</h2>
        <p className="mt-1 text-sm text-text-muted">{copy.intro}</p>
      </div>

      <form onSubmit={handleSaveLink} className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          {copy.linkTitle}
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField
            id="preview-url"
            label={copy.url}
            type="text"
            inputMode="url"
            placeholder={copy.urlPlaceholder}
            value={previewUrl}
            onValueChange={setPreviewUrl}
            maxLength={2048}
          />
          <FormField
            id="preview-label"
            label={copy.label}
            placeholder={copy.labelPlaceholder}
            value={previewLabel}
            onValueChange={setPreviewLabel}
            maxLength={80}
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={savingLink}
            className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {savingLink ? copy.saving : copy.saveLink}
          </button>
          {(project.preview_url || previewUrl) && (
            <button
              type="button"
              onClick={handleRemoveLink}
              disabled={savingLink}
              className="rounded-full border border-border px-4 py-2 text-sm text-text-muted transition-colors hover:border-red-400 hover:text-red-300 disabled:opacity-60"
            >
              {copy.removeLink}
            </button>
          )}
        </div>
        {project.preview_url && (
          <a
            href={project.preview_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-sm text-accent hover:underline"
          >
            {project.preview_label || project.preview_url}
          </a>
        )}
        {linkMessage && (
          <p role="status" className="text-sm text-accent">
            {linkMessage}
          </p>
        )}
        {linkError && <p className="text-sm text-red-300">{linkError}</p>}
      </form>

      <form onSubmit={handleUpload} className="space-y-3 border-t border-border pt-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          {copy.uploadTitle}
        </h3>
        <div>
          <label htmlFor="preview-file" className="mb-1.5 block text-sm font-medium text-text">
            {copy.file}
          </label>
          <input
            ref={fileInputRef}
            id="preview-file"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            className="block w-full cursor-pointer rounded-lg border border-border bg-background px-4 py-3 text-sm text-text-muted file:mr-3 file:rounded-full file:border-0 file:bg-surface-light file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-text hover:file:bg-border"
          />
          <p className="mt-1 text-xs text-text-muted">{copy.fileHint}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField
            id="preview-caption"
            label={copy.caption}
            placeholder={copy.captionPlaceholder}
            value={caption}
            onValueChange={setCaption}
            maxLength={200}
          />
          <SelectField
            id="preview-stage"
            label={copy.stage}
            value={stageId}
            onValueChange={setStageId}
            options={stageOptions}
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-text-muted">
          <input
            type="checkbox"
            checked={clientVisible}
            onChange={(event) => setClientVisible(event.target.checked)}
            className="h-4 w-4 rounded border-border bg-background accent-accent"
          />
          {copy.visible}
        </label>
        <button
          type="submit"
          disabled={uploading}
          className="rounded-full border border-border px-4 py-2 text-sm font-medium text-text transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-60"
        >
          {uploading ? copy.uploading : copy.upload}
        </button>
        {uploadMessage && (
          <p role="status" className="text-sm text-accent">
            {uploadMessage}
          </p>
        )}
        {uploadError && <p className="text-sm text-red-300">{uploadError}</p>}
      </form>

      <div className="space-y-3 border-t border-border pt-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          {copy.title}
        </h3>
        {galleryError && <p className="text-sm text-red-300">{galleryError}</p>}
        {previews.length === 0 ? (
          <p className="text-sm text-text-muted">{copy.empty}</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {previews.map((preview) => {
              const stage = stages.find((item) => item.id === preview.stage_id)
              const busy = busyId === preview.id
              return (
                <li
                  key={preview.id}
                  className="overflow-hidden rounded-xl border border-border bg-surface"
                >
                  {preview.url ? (
                    <img
                      src={preview.url}
                      alt={preview.caption || 'Captura del avance'}
                      loading="lazy"
                      decoding="async"
                      className="aspect-video w-full object-cover"
                    />
                  ) : (
                    <div className="flex aspect-video items-center justify-center bg-background p-4 text-center text-xs text-text-muted">
                      {copy.unavailable}
                    </div>
                  )}
                  <div className="space-y-2 p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm text-text">
                        {preview.caption || 'Captura del avance'}
                      </span>
                      {!preview.client_visible && <Badge>{copy.hidden}</Badge>}
                    </div>
                    {stage && (
                      <p className="text-xs text-text-muted">
                        {copy.stageLabel}: {stage.name}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => handleToggleVisibility(preview)}
                        className="rounded border border-border px-2 py-1 text-xs text-text-muted hover:border-accent hover:text-accent disabled:opacity-60"
                      >
                        {preview.client_visible ? copy.hide : copy.show}
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => handleDelete(preview)}
                        className="rounded border border-border px-2 py-1 text-xs text-text-muted hover:border-red-400 hover:text-red-300 disabled:opacity-60"
                      >
                        {copy.remove}
                      </button>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}

import { panelCopy } from '../../data/panel'
import type { Project, ProjectPreviewWithUrl, ProjectStage } from '../../lib/types'

export type ProjectPreviewGalleryProps = {
  project: Project
  stages: ProjectStage[]
  previews: ProjectPreviewWithUrl[]
}

const copy = panelCopy.client.preview

/** Galería de avance visible para el cliente (solo capturas publicadas). */
export function ProjectPreviewGallery({ project, stages, previews }: ProjectPreviewGalleryProps) {
  if (!project.preview_url && previews.length === 0) return null

  return (
    <section aria-label={copy.title} className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
            {copy.title}
          </h2>
          <p className="mt-1 text-sm text-text-muted">{copy.intro}</p>
        </div>
        {project.preview_url && (
          <a
            href={project.preview_url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-background transition-opacity hover:opacity-90"
          >
            {project.preview_label || copy.open}
          </a>
        )}
      </div>

      {previews.length > 0 && (
        <ul aria-label={copy.galleryLabel} className="grid gap-4 sm:grid-cols-2">
          {previews.map((preview) => {
            const stage = stages.find((item) => item.id === preview.stage_id)
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
                <div className="space-y-1 p-4">
                  {preview.caption && <p className="text-sm text-text">{preview.caption}</p>}
                  {stage && (
                    <p className="text-xs text-text-muted">
                      {copy.stage}: {stage.name}
                    </p>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

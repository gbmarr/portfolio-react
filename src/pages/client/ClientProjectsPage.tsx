import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '../../components/ui/Badge'
import { panelCopy, statusLabels, statusTones } from '../../data/panel'
import { formatDate } from '../../lib/format'
import { listProjects, listStages } from '../../lib/projects'
import type { Project, ProjectStage } from '../../lib/types'

export type ClientProjectRow = {
  project: Project
  stages: ProjectStage[]
  done: number
  total: number
}

/** Progreso del proyecto: etapas completadas sobre el total visible. */
export function computeProgress(stages: ProjectStage[]): { done: number; total: number } {
  const done = stages.filter((stage) => stage.status === 'completada').length
  return { done, total: stages.length }
}

type LoadState =
  | { loading: true; error: null; rows: null }
  | { loading: false; error: string | null; rows: ClientProjectRow[] | null }

/** Lista de proyectos del cliente con su barra de progreso (RLS filtra). */
export function ClientProjectsPage() {
  const [state, setState] = useState<LoadState>({ loading: true, error: null, rows: null })

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const projects = await listProjects()
        const rows = await Promise.all(
          projects.map(async (project) => {
            const stages = await listStages(project.id)
            return { project, stages, ...computeProgress(stages) }
          }),
        )
        if (!cancelled) setState({ loading: false, error: null, rows })
      } catch {
        if (!cancelled) setState({ loading: false, error: panelCopy.error.generic, rows: null })
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  if (state.loading) {
    return (
      <p role="status" className="animate-pulse text-text-muted">
        {panelCopy.loading}
      </p>
    )
  }

  if (state.error) {
    return (
      <p role="alert" className="rounded-lg border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-300">
        {state.error}
      </p>
    )
  }

  const rows = state.rows ?? []

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="font-display text-2xl font-semibold text-text">{panelCopy.client.projectsTitle}</h1>
        <p className="text-sm text-text-muted">{panelCopy.client.projectsIntro}</p>
      </header>

      {rows.length === 0 ? (
        <p className="text-text-muted">{panelCopy.client.emptyProjects}</p>
      ) : (
        <ul className="space-y-4">
          {rows.map(({ project, done, total }) => {
            const percent = total === 0 ? 0 : Math.round((done / total) * 100)
            return (
              <li
                key={project.id}
                className="rounded-xl border border-border bg-background/60 p-5 transition-colors hover:border-accent/60"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    to={`/panel/${project.id}`}
                    className="font-display text-lg font-semibold text-text hover:text-accent"
                  >
                    {project.title}
                  </Link>
                  <Badge tone={statusTones.project[project.status]}>
                    {statusLabels.project[project.status]}
                  </Badge>
                  <span className="text-xs text-text-muted">{statusLabels.type[project.type]}</span>
                </div>

                {project.deadline && (
                  <p className="mt-2 text-sm text-text-muted">
                    {panelCopy.client.deadline}: {formatDate(project.deadline)}
                  </p>
                )}

                <div className="mt-4">
                  <div
                    role="progressbar"
                    aria-valuenow={percent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={project.title}
                    className="h-1.5 w-full overflow-hidden rounded-full bg-border/60"
                  >
                    <div
                      className={`h-full rounded-full transition-all ${percent === 100 ? 'bg-emerald-300' : 'bg-accent'}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-text-muted">{panelCopy.client.progress(done, total)}</p>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
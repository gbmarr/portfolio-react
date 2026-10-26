import { Link } from 'react-router-dom'
import { Badge } from '../../components/ui/Badge'
import { Loading } from '../../components/ui/Loading'
import { ErrorAlert } from '../../components/ui/ErrorAlert'
import { useAsyncData } from '../../hooks/useAsyncData'
import { useAuth } from '../../lib/auth-context'
import { panelCopy, statusLabels, statusTones } from '../../data/panel'
import { formatDate } from '../../lib/format'
import {
  listProjects,
  listStagesForProjects,
  computeProgress,
  loadProjectDetail,
  type ProjectDetail,
} from '../../lib/projects'
import type { Project, ProjectStage } from '../../lib/types'
import { ClientProjectDetailView } from './ClientProjectDetailView'

export type ClientProjectRow = {
  project: Project
  stages: ProjectStage[]
  done: number
  total: number
}

type PanelData =
  | { kind: 'empty' }
  | { kind: 'single'; detail: ProjectDetail }
  | { kind: 'list'; rows: ClientProjectRow[] }

/** Lista de proyectos del cliente o detalle directo si solo tiene uno (RLS filtra). */
export function ClientProjectsPage() {
  const { session } = useAuth()
  const { data, error, loading, reload } = useAsyncData<PanelData>(async () => {
    const projects = await listProjects()

    if (projects.length === 0) {
      return { kind: 'empty' }
    }

    if (projects.length === 1) {
      return { kind: 'single', detail: await loadProjectDetail(projects[0].id) }
    }

    const stagesByProject = await listStagesForProjects(projects.map((project) => project.id))
    const rows = projects.map((project) => {
      const stages = stagesByProject[project.id] ?? []
      return { project, stages, ...computeProgress(stages) }
    })

    return { kind: 'list', rows }
  }, [])

  if (loading) {
    return <Loading />
  }

  if (error) {
    return <ErrorAlert>{error}</ErrorAlert>
  }

  if (data?.kind === 'single') {
    return (
      <ClientProjectDetailView
        detail={data.detail}
        clientId={session?.user.id ?? ''}
        onReload={reload}
        showBackLink={false}
      />
    )
  }

  const rows = data?.kind === 'list' ? data.rows : []

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="font-display text-2xl font-semibold text-text">
          {panelCopy.client.projectsTitle}
        </h1>
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
                      className={`h-full w-full origin-left rounded-full transition-transform duration-[400ms] ease-out motion-reduce:transition-none ${
                        percent === 100 ? 'bg-emerald-300' : 'bg-accent'
                      }`}
                      style={{ transform: `scaleX(${percent / 100})` }}
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-text-muted">
                    {panelCopy.client.progress(done, total)}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

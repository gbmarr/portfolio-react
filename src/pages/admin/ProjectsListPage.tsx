import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listProjects } from '../../lib/projects'
import { formatDate } from '../../lib/format'
import { Badge } from '../../components/ui/Badge'
import { statusLabels, statusTones, panelCopy } from '../../data/panel'
import type { Project } from '../../lib/types'

type State =
  | { loading: true; error: null; projects: null }
  | { loading: false; error: string | null; projects: Project[] | null }

/** Listado de todos los proyectos con acceso al detalle. */
export function ProjectsListPage() {
  const [state, setState] = useState<State>({ loading: true, error: null, projects: null })

  useEffect(() => {
    let cancelled = false
    listProjects()
      .then((projects) => {
        if (!cancelled) setState({ loading: false, error: null, projects })
      })
      .catch(() => {
        if (!cancelled) setState({ loading: false, error: panelCopy.error.generic, projects: null })
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-text">{panelCopy.nav.projects}</h1>
        <Link
          to="/admin/proyectos/nuevo"
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-accent/90"
        >
          Nuevo proyecto
        </Link>
      </div>

      {state.loading && (
        <p role="status" className="animate-pulse text-text-muted">
          {panelCopy.loading}
        </p>
      )}

      {state.error && (
        <p role="alert" className="rounded-lg border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-300">
          {state.error}
        </p>
      )}

      {state.projects && state.projects.length === 0 && (
        <p className="rounded-xl border border-border bg-background/60 px-4 py-8 text-center text-text-muted">
          Todavía no hay proyectos. Creá el primero con “Nuevo proyecto”.
        </p>
      )}

      {state.projects && state.projects.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-background/60 text-xs uppercase tracking-wider text-text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Proyecto</th>
                <th className="px-4 py-3 font-semibold">Cliente</th>
                <th className="px-4 py-3 font-semibold">Tipo</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 font-semibold">Entrega</th>
              </tr>
            </thead>
            <tbody>
              {state.projects.map((project) => (
                <tr key={project.id} className="border-b border-border last:border-b-0 hover:bg-background/40">
                  <td className="px-4 py-3">
                    <Link
                      to={`/admin/proyectos/${project.id}`}
                      className="font-medium text-text hover:text-accent"
                    >
                      {project.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-text-muted">{project.client_email}</td>
                  <td className="px-4 py-3 text-text-muted">{statusLabels.type[project.type]}</td>
                  <td className="px-4 py-3">
                    <Badge tone={statusTones.project[project.status]}>
                      {statusLabels.project[project.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-text-muted">{formatDate(project.deadline)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

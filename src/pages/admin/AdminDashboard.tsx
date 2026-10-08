import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { computeKpis, type DashboardKpis } from '../../lib/dashboard'
import { listProjects } from '../../lib/projects'
import { listMessages } from '../../lib/messages'
import { panelCopy } from '../../data/panel'

type State =
  | { loading: true; error: null; kpis: null }
  | { loading: false; error: string | null; kpis: DashboardKpis | null }

function StatCard({
  label,
  value,
  danger = false,
}: {
  label: string
  value: string | number
  danger?: boolean
}) {
  return (
    <div data-testid={`stat-${label}`} className="rounded-xl border border-border bg-background/60 p-5">
      <p className="text-sm text-text-muted">{label}</p>
      <p
        className={`mt-1 font-display text-3xl font-semibold ${danger ? 'text-red-300' : 'text-text'}`}
      >
        {value}
      </p>
    </div>
  )
}

/** Resumen operativo: actividad, vencimientos y mensajes. */
export function AdminDashboard() {
  const [state, setState] = useState<State>({ loading: true, error: null, kpis: null })

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const [projects, messages] = await Promise.all([listProjects(), listMessages()])
        if (!cancelled) {
          setState({ loading: false, error: null, kpis: computeKpis(projects, messages) })
        }
      } catch {
        if (!cancelled) {
          setState({ loading: false, error: panelCopy.error.generic, kpis: null })
        }
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

  if (state.error || !state.kpis) {
    return (
      <p role="alert" className="rounded-lg border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-300">
        {state.error ?? panelCopy.error.generic}
      </p>
    )
  }

  const { kpis } = state

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-semibold text-text">{panelCopy.nav.dashboard}</h1>

      <section aria-label="Proyectos" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Proyectos en curso" value={kpis.activeProjects} />
        <StatCard label="Entregas en 7 días" value={kpis.upcomingDeadlines} />
        <StatCard label="Entregas vencidas" value={kpis.overdueDeadlines} danger={kpis.overdueDeadlines > 0} />
        <Link
          to="/admin/mensajes"
          data-testid="stat-Mensajes"
          className="rounded-xl border border-border bg-background/60 p-5 transition-colors hover:border-accent"
        >
          <p className="text-sm text-text-muted">{panelCopy.nav.messages}</p>
          <p className="mt-1 font-display text-3xl font-semibold text-text">{kpis.unreadMessages}</p>
          <p className="mt-1 text-xs text-text-muted">sin leer</p>
        </Link>
      </section>
    </div>
  )
}

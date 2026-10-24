import { Link } from 'react-router-dom'
import { computeKpis, type DashboardKpis } from '../../lib/dashboard'
import { listProjects } from '../../lib/projects'
import { listMessages } from '../../lib/messages'
import { listQuoteRequests } from '../../lib/quoteRequests'
import { listBriefs } from '../../lib/briefs'
import { useAsyncData } from '../../hooks/useAsyncData'
import { Loading } from '../../components/ui/Loading'
import { ErrorAlert } from '../../components/ui/ErrorAlert'
import { panelCopy } from '../../data/panel'

type BriefStats = { completed: number; pending: number }
type DashboardData = { kpis: DashboardKpis; briefs: BriefStats; newQuotes: number }

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
    <div
      data-testid={`stat-${label}`}
      className="rounded-xl border border-border bg-background/60 p-5"
    >
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
  const { data, error, loading } = useAsyncData(async () => {
    const [projects, messages, briefs, quotes] = await Promise.all([
      listProjects(),
      listMessages(),
      listBriefs(),
      listQuoteRequests(),
    ])
    const completed = briefs.filter((brief) => brief.status === 'completado').length
    return {
      kpis: computeKpis(projects, messages),
      briefs: { completed, pending: briefs.length - completed },
      newQuotes: quotes.filter((quote) => quote.status === 'new').length,
    } satisfies DashboardData
  }, [])

  if (loading) {
    return <Loading />
  }

  if (error || !data) {
    return <ErrorAlert>{error ?? panelCopy.error.generic}</ErrorAlert>
  }

  const { kpis, briefs, newQuotes } = data

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-semibold text-text">{panelCopy.nav.dashboard}</h1>

      <section aria-label="Proyectos" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Proyectos en curso" value={kpis.activeProjects} />
        <StatCard label="Entregas en 7 días" value={kpis.upcomingDeadlines} />
        <StatCard
          label="Entregas vencidas"
          value={kpis.overdueDeadlines}
          danger={kpis.overdueDeadlines > 0}
        />
        <Link
          to="/admin/mensajes"
          data-testid="stat-Mensajes"
          className="rounded-xl border border-border bg-background/60 p-5 transition-colors hover:border-accent"
        >
          <p className="text-sm text-text-muted">{panelCopy.nav.messages}</p>
          <p className="mt-1 font-display text-3xl font-semibold text-text">
            {kpis.unreadMessages}
          </p>
          <p className="mt-1 text-xs text-text-muted">sin leer</p>
        </Link>
        <Link
          to="/admin/presupuestos"
          data-testid="stat-Presupuestos"
          className="rounded-xl border border-border bg-background/60 p-5 transition-colors hover:border-accent"
        >
          <p className="text-sm text-text-muted">{panelCopy.nav.quotes}</p>
          <p className="mt-1 font-display text-3xl font-semibold text-text">{newQuotes}</p>
          <p className="mt-1 text-xs text-text-muted">nuevas</p>
        </Link>
        <StatCard label="Briefs completados" value={briefs.completed} />
        <StatCard label="Briefs pendientes" value={briefs.pending} />
      </section>
    </div>
  )
}

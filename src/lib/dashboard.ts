import type { ContactMessage, Currency, Payment, Project, ProjectStatus } from './types'

export type TotalsByCurrency = Record<Currency, { paid: number; pending: number }>

export type DashboardKpis = {
  activeProjects: number
  /** Entregas con fecha dentro de los próximos 7 días (proyectos en curso). */
  upcomingDeadlines: number
  /** Entregas vencidas de proyectos no terminados/cancelados. */
  overdueDeadlines: number
  unreadMessages: number
  totals: TotalsByCurrency
}

const DEADLINE_WINDOW_DAYS = 7
const DAY_MS = 24 * 60 * 60 * 1000

const OPEN_STATUSES: ProjectStatus[] = ['lead', 'en_progreso', 'pausado']

function emptyTotals(): TotalsByCurrency {
  return { ARS: { paid: 0, pending: 0 }, USD: { paid: 0, pending: 0 } }
}

/** KPIs del dashboard del admin. Función pura: fácil de testear. */
export function computeKpis(
  projects: Project[],
  messages: ContactMessage[],
  payments: Payment[],
  today: Date = new Date(),
): DashboardKpis {
  const totals = emptyTotals()

  const activeProjects = projects.filter((project) => project.status === 'en_progreso').length

  let upcomingDeadlines = 0
  let overdueDeadlines = 0

  for (const project of projects) {
    if (!project.deadline || !OPEN_STATUSES.includes(project.status)) continue
    const deadline = new Date(`${project.deadline}T00:00:00`)
    const diffDays = (deadline.getTime() - today.getTime()) / DAY_MS
    if (diffDays < 0) overdueDeadlines += 1
    else if (diffDays <= DEADLINE_WINDOW_DAYS) upcomingDeadlines += 1
  }

  for (const payment of payments) {
    const bucket = totals[payment.currency]
    if (payment.status === 'pagado') bucket.paid += Number(payment.amount)
    else bucket.pending += Number(payment.amount)
  }

  const unreadMessages = messages.filter((message) => message.read_at === null).length

  return { activeProjects, upcomingDeadlines, overdueDeadlines, unreadMessages, totals }
}

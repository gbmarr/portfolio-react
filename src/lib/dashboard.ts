import { argentinaDateKey } from './format'
import type { ContactMessage, Project, ProjectStatus } from './types'

export type DashboardKpis = {
  activeProjects: number
  /** Entregas con fecha dentro de los próximos 7 días (proyectos en curso). */
  upcomingDeadlines: number
  /** Entregas vencidas de proyectos no terminados/cancelados. */
  overdueDeadlines: number
  unreadMessages: number
}

const DEADLINE_WINDOW_DAYS = 7
const DAY_MS = 24 * 60 * 60 * 1000

const OPEN_STATUSES: ProjectStatus[] = ['lead', 'en_progreso', 'pausado']

/** Convierte una clave 'YYYY-MM-DD' a milisegundos UTC de medianoche. */
function dateKeyToUtcMs(key: string): number {
  const [year, month, day] = key.split('-').map(Number)
  return Date.UTC(year, month - 1, day)
}

/** KPIs del dashboard del admin. Función pura: fácil de testear. */
export function computeKpis(
  projects: Project[],
  messages: ContactMessage[],
  today: Date = new Date()
): DashboardKpis {
  const activeProjects = projects.filter((project) => project.status === 'en_progreso').length

  let upcomingDeadlines = 0
  let overdueDeadlines = 0

  const todayMs = dateKeyToUtcMs(argentinaDateKey(today))

  for (const project of projects) {
    if (!project.deadline || !OPEN_STATUSES.includes(project.status)) continue
    const deadlineMs = dateKeyToUtcMs(project.deadline)
    const diffDays = (deadlineMs - todayMs) / DAY_MS
    if (diffDays < 0) overdueDeadlines += 1
    else if (diffDays <= DEADLINE_WINDOW_DAYS) upcomingDeadlines += 1
  }

  const unreadMessages = messages.filter((message) => message.read_at === null).length

  return { activeProjects, upcomingDeadlines, overdueDeadlines, unreadMessages }
}

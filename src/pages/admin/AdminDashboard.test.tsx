import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AdminDashboard } from './AdminDashboard'
import type { ContactMessage, Project, ProjectBrief } from '../../lib/types'

const h = vi.hoisted(() => ({
  listProjects: vi.fn(),
  listMessages: vi.fn(),
  listBriefs: vi.fn(),
}))

vi.mock('../../lib/projects', () => ({ listProjects: h.listProjects }))
vi.mock('../../lib/messages', () => ({ listMessages: h.listMessages }))
vi.mock('../../lib/briefs', () => ({ listBriefs: h.listBriefs }))

beforeEach(() => {
  h.listBriefs.mockResolvedValue([])
})

const DAY_MS = 86_400_000
const project = (over: Partial<Project> = {}): Project => ({
  id: 'p1',
  client_email: 'cliente@example.com',
  title: 'Proyecto A',
  type: 'web',
  status: 'en_progreso',
  start_date: null,
  deadline: null,
  description: null,
  created_at: '2026-09-01T00:00:00Z',
  updated_at: '2026-09-01T00:00:00Z',
  completed_at: null,
  ...over,
})

const message = (over: Partial<ContactMessage> = {}): ContactMessage => ({
  id: 'm1',
  name: 'Ana',
  email: 'ana@example.com',
  message: 'Hola, me interesa un sitio.',
  subject: 'Consulta',
  read_at: null,
  created_at: '2026-09-01T00:00:00Z',
  ...over,
})

const brief = (over: Partial<ProjectBrief> = {}): ProjectBrief => ({
  id: 'b1',
  project_id: 'p1',
  service_type: 'landing',
  extra_ids: [],
  answers: {},
  status: 'pendiente',
  created_at: '2026-10-08T00:00:00Z',
  updated_at: '2026-10-08T00:00:00Z',
  ...over,
})

function renderDashboard() {
  return render(
    <MemoryRouter initialEntries={['/admin']}>
      <AdminDashboard />
    </MemoryRouter>,
  )
}

describe('AdminDashboard', () => {
  it('muestra loading mientras carga', () => {
    h.listProjects.mockReturnValue(new Promise(() => {}))
    h.listMessages.mockResolvedValue([])
    renderDashboard()
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('muestra error si falla la carga', async () => {
    h.listProjects.mockRejectedValue(new Error('boom'))
    h.listMessages.mockResolvedValue([])
    renderDashboard()
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Algo salió mal. Probá de nuevo en unos minutos.',
    )
  })

  it('resume KPIs: actividad, vencimientos y mensajes', async () => {
    const upcoming = new Date(Date.now() + 3 * DAY_MS).toISOString()
    h.listProjects.mockResolvedValue([
      project(),
      project({ id: 'p2', status: 'en_progreso', deadline: upcoming.split('T')[0] }),
    ])
    h.listMessages.mockResolvedValue([
      message(),
      message({ id: 'm2', read_at: '2026-09-02T00:00:00Z' }),
    ])

    renderDashboard()

    function stat(label: string) {
      return within(screen.getByTestId(`stat-${label}`))
    }

    expect(await screen.findByText('Proyectos en curso')).toBeInTheDocument()
    expect(stat('Proyectos en curso').getByText('2')).toBeInTheDocument()
    expect(stat('Entregas en 7 días').getByText('1')).toBeInTheDocument()
    expect(screen.getByText('Entregas vencidas')).toBeInTheDocument()
    expect(stat('Entregas vencidas').getByText('0')).toBeInTheDocument()
    expect(screen.getByText('sin leer')).toBeInTheDocument()
    expect(stat('Mensajes').getByText('1')).toBeInTheDocument()
  })

  it('resume briefs completados y pendientes', async () => {
    h.listProjects.mockResolvedValue([])
    h.listMessages.mockResolvedValue([])
    h.listBriefs.mockResolvedValue([
      brief({ status: 'completado' }),
      brief({ id: 'b2', status: 'pendiente' }),
      brief({ id: 'b3', status: 'pendiente' }),
    ])

    renderDashboard()

    await screen.findByText('Proyectos en curso')
    expect(within(screen.getByTestId('stat-Briefs completados')).getByText('1')).toBeInTheDocument()
    expect(within(screen.getByTestId('stat-Briefs pendientes')).getByText('2')).toBeInTheDocument()
  })

  it('no muestra la sección de finanzas', async () => {
    h.listProjects.mockResolvedValue([])
    h.listMessages.mockResolvedValue([])

    renderDashboard()

    expect(await screen.findByText('Proyectos en curso')).toBeInTheDocument()
    expect(screen.queryByRole('region', { name: 'Finanzas' })).not.toBeInTheDocument()
    expect(screen.queryByText(/Cobrado/)).not.toBeInTheDocument()
  })

  it('marca vencidas en rojo cuando hay entregas vencidas', async () => {
    const overdue = new Date(Date.now() - 2 * DAY_MS).toISOString()
    h.listProjects.mockResolvedValue([
      project({ id: 'p-over', status: 'en_progreso', deadline: overdue.split('T')[0] }),
    ])
    h.listMessages.mockResolvedValue([])

    renderDashboard()

    await screen.findByText('Entregas vencidas')
    const value = within(screen.getByTestId('stat-Entregas vencidas')).getByText('1')
    expect(value).toHaveClass('text-red-300')
  })
})
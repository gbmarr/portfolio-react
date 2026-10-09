import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ClientProjectsPage, computeProgress } from './ClientProjectsPage'
import type { Project, ProjectStage } from '../../lib/types'

const h = vi.hoisted(() => ({
  listProjects: vi.fn(),
  listStages: vi.fn(),
}))

vi.mock('../../lib/projects', () => ({ listProjects: h.listProjects, listStages: h.listStages }))

const project = (over: Partial<Project> = {}): Project => ({
  id: 'p1',
  client_email: 'cliente@example.com',
  title: 'Sitio web para Estudio',
  type: 'web',
  status: 'en_progreso',
  start_date: null,
  deadline: '2026-11-15',
  description: null,
  created_at: '2026-09-01T00:00:00Z',
  updated_at: '2026-09-01T00:00:00Z',
  completed_at: null,
  ...over,
})

const stage = (over: Partial<ProjectStage> = {}): ProjectStage => ({
  id: 's1',
  project_id: 'p1',
  name: 'Diseño',
  description: null,
  position: 0,
  status: 'completada',
  client_visible: true,
  started_at: null,
  completed_at: null,
  notes: null,
  created_at: '2026-09-01T00:00:00Z',
  ...over,
})

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((r) => {
    resolve = r
  })
  return { promise, resolve }
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/panel']}>
      <ClientProjectsPage />
    </MemoryRouter>,
  )
}

describe('ClientProjectsPage', () => {
  it('muestra loading mientras carga', () => {
    const d = deferred<Project[]>()
    h.listProjects.mockReturnValue(d.promise)
    renderPage()
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('muestra error si falla la carga', async () => {
    h.listProjects.mockRejectedValue(new Error('boom'))
    renderPage()
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Algo salió mal. Probá de nuevo en unos minutos.',
    )
  })

  it('muestra estado vacío', async () => {
    h.listProjects.mockResolvedValue([])
    renderPage()
    expect(await screen.findByText(/Todavía no tenés proyectos/)).toBeInTheDocument()
  })

  it('lista proyectos con barra de progreso y link al detalle', async () => {
    h.listProjects.mockResolvedValue([
      project(),
      project({
        id: 'p2',
        title: 'Landing para Clínica',
        type: 'landing',
        status: 'completado',
        deadline: null,
      }),
    ])
    h.listStages.mockImplementation(async (projectId: string) =>
      projectId === 'p1'
        ? [stage(), stage({ id: 's2', status: 'pendiente' })]
        : [stage({ id: 's3', status: 'completada' })],
    )

    renderPage()

    expect(await screen.findByText('Sitio web para Estudio')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Sitio web para Estudio' })).toHaveAttribute(
      'href',
      '/panel/p1',
    )
    expect(screen.getByText('Landing para Clínica')).toBeInTheDocument()
    expect(screen.getAllByText('Completado').length).toBeGreaterThan(0)
    expect(screen.getByText('Entrega estimada: 15/11/2026')).toBeInTheDocument()
    expect(screen.getByText('1 de 2 etapas completadas')).toBeInTheDocument()
    expect(screen.getByText('1 de 1 etapas completadas')).toBeInTheDocument()
    expect(screen.getByRole('progressbar', { name: 'Sitio web para Estudio' })).toHaveAttribute(
      'aria-valuenow',
      '50',
    )
  })
})

describe('computeProgress', () => {
  it('cuenta etapas completadas sobre el total', () => {
    expect(computeProgress([stage(), stage({ id: 's2' }), stage({ id: 's3', status: 'en_progreso' })])).toEqual({
      done: 2,
      total: 3,
    })
  })

  it('devuelve cero con etapas vacías', () => {
    expect(computeProgress([])).toEqual({ done: 0, total: 0 })
  })
})
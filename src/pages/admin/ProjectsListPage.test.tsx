import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ProjectsListPage } from './ProjectsListPage'
import type { Project } from '../../lib/types'

const h = vi.hoisted(() => ({
  listProjects: vi.fn(),
}))

vi.mock('../../lib/projects', () => ({ listProjects: h.listProjects }))

const project = (over: Partial<Project> = {}): Project => ({
  id: 'p1',
  client_email: 'cliente@example.com',
  title: 'Sitio web para Estudio',
  type: 'web',
  status: 'en_progreso',
  start_date: '2026-09-01',
  deadline: '2026-11-15',
  description: null,
  created_at: '2026-09-01T00:00:00Z',
  updated_at: '2026-09-01T00:00:00Z',
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
    <MemoryRouter initialEntries={['/admin/proyectos']}>
      <ProjectsListPage />
    </MemoryRouter>,
  )
}

describe('ProjectsListPage', () => {
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
    expect(await screen.findByText(/Todavía no hay proyectos/)).toBeInTheDocument()
  })

  it('lista los proyectos en una tabla con link al detalle', async () => {
    h.listProjects.mockResolvedValue([
      project(),
      project({ id: 'p2', title: 'Landing para Clínica', type: 'landing', status: 'lead', client_email: 'otro@example.com', deadline: '2026-12-20' }),
    ])
    renderPage()

    expect(await screen.findByText('Sitio web para Estudio')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Sitio web para Estudio' })).toHaveAttribute(
      'href',
      '/admin/proyectos/p1',
    )
    expect(screen.getByText('Landing para Clínica')).toBeInTheDocument()
    expect(screen.getByText('cliente@example.com')).toBeInTheDocument()
    expect(screen.getByText('otro@example.com')).toBeInTheDocument()
    expect(screen.getByText('En progreso')).toBeInTheDocument()
    expect(screen.queryByText('Monto')).not.toBeInTheDocument()
    expect(screen.getByText('15/11/2026')).toBeInTheDocument()
    expect(screen.getByText('20/12/2026')).toBeInTheDocument()
  })
})
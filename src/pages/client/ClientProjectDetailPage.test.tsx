import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ClientProjectDetailPage } from './ClientProjectDetailPage'
import type { ApprovalDecision, MilestoneApproval, Project, ProjectStage } from '../../lib/types'

const h = vi.hoisted(() => ({
  useAuth: vi.fn(),
  getProject: vi.fn(),
  listStages: vi.fn(),
  listApprovals: vi.fn(),
  decideMilestone: vi.fn(),
}))

vi.mock('../../lib/auth', () => ({ useAuth: h.useAuth }))
vi.mock('../../lib/projects', () => ({
  getProject: h.getProject,
  listStages: h.listStages,
  listApprovals: h.listApprovals,
  decideMilestone: h.decideMilestone,
}))

const project = (over: Partial<Project> = {}): Project => ({
  id: 'p1',
  client_email: 'cliente@example.com',
  title: 'Sitio web para Estudio',
  type: 'web',
  status: 'en_progreso',
  start_date: null,
  deadline: '2026-11-15',
  description: 'Rediseño completo del sitio.',
  created_at: '2026-09-01T00:00:00Z',
  updated_at: '2026-09-01T00:00:00Z',
  ...over,
})

const stage = (over: Partial<ProjectStage> = {}): ProjectStage => ({
  id: 's1',
  project_id: 'p1',
  name: 'Diseño',
  description: 'Propuesta visual',
  position: 0,
  status: 'completada',
  client_visible: true,
  started_at: '2026-09-10T00:00:00',
  completed_at: '2026-09-20T00:00:00',
  notes: null,
  created_at: '2026-09-01T00:00:00',
  ...over,
})

const approval = (over: Partial<MilestoneApproval> = {}): MilestoneApproval => ({
  id: 'a1',
  stage_id: 's1',
  project_id: 'p1',
  client_id: 'client-1',
  decision: 'aprobado',
  comment: null,
  created_at: '2026-09-21T00:00:00Z',
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
    <MemoryRouter initialEntries={['/panel/p1']}>
      <Routes>
        <Route path="/panel/:id" element={<ClientProjectDetailPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ClientProjectDetailPage', () => {
  beforeEach(() => {
    h.useAuth.mockReturnValue({ session: { user: { id: 'client-1' } } })
    h.getProject.mockResolvedValue(project())
    h.listStages.mockResolvedValue([stage()])
    h.listApprovals.mockResolvedValue([])
  })

  it('muestra loading mientras carga', () => {
    const d = deferred<Project>()
    h.getProject.mockReturnValue(d.promise)
    renderPage()
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('muestra "no encontrado" si el proyecto no existe', async () => {
    h.getProject.mockRejectedValue(new Error('Proyecto no encontrado'))
    renderPage()
    expect(await screen.findByRole('alert')).toHaveTextContent('No encontramos este proyecto.')
    expect(screen.getByRole('link', { name: '← Mis proyectos' })).toHaveAttribute('href', '/panel')
  })

  it('muestra error genérico si falla la carga', async () => {
    h.listStages.mockRejectedValue(new Error('boom'))
    renderPage()
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Algo salió mal. Probá de nuevo en unos minutos.',
    )
  })

  it('muestra timeline con solo etapas visibles y sus estados', async () => {
    h.listStages.mockResolvedValue([
      stage(),
      stage({ id: 's2', name: 'Maquetado', status: 'en_progreso', started_at: null, completed_at: null }),
      stage({
        id: 's3',
        name: 'Interna',
        status: 'completada',
        client_visible: false,
        started_at: null,
        completed_at: null,
      }),
    ])

    renderPage()

    expect(await screen.findByText('Sitio web para Estudio')).toBeInTheDocument()
    expect(screen.getByText('Diseño')).toBeInTheDocument()
    expect(screen.getByText('Maquetado')).toBeInTheDocument()
    expect(screen.queryByText('Interna')).not.toBeInTheDocument()
    expect(screen.getAllByText('Completada').length).toBeGreaterThan(0)
    expect(screen.getAllByText('En progreso').length).toBeGreaterThan(0)
    expect(screen.getByText(/Inicio: 10\/09\/2026/)).toBeInTheDocument()
    expect(screen.getByText(/Fin: 20\/09\/2026/)).toBeInTheDocument()
  })

  it('muestra la decisión ya tomada sobre una etapa', async () => {
    h.listApprovals.mockResolvedValue([
      approval(),
      approval({ id: 'a2', stage_id: 's2', decision: 'rechazado', comment: 'Cambiar paleta' }),
    ])
    h.listStages.mockResolvedValue([
      stage(),
      stage({ id: 's2', name: 'Maquetado', status: 'revision', started_at: null, completed_at: null }),
    ])

    renderPage()

    expect(await screen.findByText('Aprobaste esta etapa')).toBeInTheDocument()
    expect(screen.getByText('Rechazaste esta etapa')).toBeInTheDocument()
    expect(screen.getByText('“Cambiar paleta”')).toBeInTheDocument()
    // Como ya hay decisión, no se ofrecen los botones de aprobar/rechazar.
    expect(screen.queryByRole('button', { name: 'Aprobar' })).not.toBeInTheDocument()
  })

  it('registra una aprobación con comentario', async () => {
    const user = userEvent.setup()
    h.decideMilestone.mockResolvedValue(approval())
    h.listStages.mockResolvedValue([
      stage({ status: 'revision', started_at: null, completed_at: null }),
    ])

    renderPage()

    await screen.findByText('Esta etapa está en revisión. Aprobala o contanos qué ajustar.')
    await user.click(screen.getByRole('button', { name: 'Aprobar' }))
    await user.type(screen.getByLabelText('Comentario'), 'Vamos con este diseño')
    await user.click(screen.getByRole('button', { name: 'Enviar decisión' }))

    await waitFor(() =>
      expect(h.decideMilestone).toHaveBeenCalledWith({
        stage_id: 's1',
        project_id: 'p1',
        client_id: 'client-1',
        decision: 'aprobado' as ApprovalDecision,
        comment: 'Vamos con este diseño',
      }),
    )
    expect(await screen.findByText('Decisión enviada.')).toBeInTheDocument()
  })

  it('puede cancelar la decisión pendiente', async () => {
    const user = userEvent.setup()
    h.listStages.mockResolvedValue([
      stage({ status: 'revision', started_at: null, completed_at: null }),
    ])

    renderPage()

    await screen.findByRole('button', { name: 'Aprobar' })
    await user.click(screen.getByRole('button', { name: 'Rechazar' }))
    expect(screen.getByRole('button', { name: 'Enviar decisión' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(screen.queryByRole('button', { name: 'Enviar decisión' })).not.toBeInTheDocument()
  })

  it('avisa si falla el envío de la decisión', async () => {
    const user = userEvent.setup()
    h.decideMilestone.mockRejectedValue(new Error('boom'))
    h.listStages.mockResolvedValue([
      stage({ status: 'revision', started_at: null, completed_at: null }),
    ])

    renderPage()

    await screen.findByRole('button', { name: 'Aprobar' })
    await user.click(screen.getByRole('button', { name: 'Aprobar' }))
    await user.click(screen.getByRole('button', { name: 'Enviar decisión' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo enviar la decisión.')
  })

  it('no renderiza la sección de pagos', async () => {
    renderPage()

    expect(await screen.findByText('Sitio web para Estudio')).toBeInTheDocument()
    expect(screen.queryByText('Pagos')).not.toBeInTheDocument()
    expect(screen.queryByText('Todavía no hay pagos cargados.')).not.toBeInTheDocument()
    expect(screen.queryByText('Monto')).not.toBeInTheDocument()
  })
})
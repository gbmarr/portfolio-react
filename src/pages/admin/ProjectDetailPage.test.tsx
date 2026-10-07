import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ProjectDetailPage } from './ProjectDetailPage'
import type { MilestoneApproval, Payment, Project, ProjectStage } from '../../lib/types'

const h = vi.hoisted(() => ({
  getProject: vi.fn(),
  listStages: vi.fn(),
  listPayments: vi.fn(),
  listApprovals: vi.fn(),
  createStage: vi.fn(),
  updateStage: vi.fn(),
  deleteStage: vi.fn(),
  reorderStages: vi.fn(),
  createPayment: vi.fn(),
  updatePayment: vi.fn(),
  deletePayment: vi.fn(),
  deleteProject: vi.fn(),
  useAuth: vi.fn(),
}))

vi.mock('../../lib/projects', () => ({
  getProject: h.getProject,
  listStages: h.listStages,
  listPayments: h.listPayments,
  listApprovals: h.listApprovals,
  createStage: h.createStage,
  updateStage: h.updateStage,
  deleteStage: h.deleteStage,
  reorderStages: h.reorderStages,
  createPayment: h.createPayment,
  updatePayment: h.updatePayment,
  deletePayment: h.deletePayment,
  deleteProject: h.deleteProject,
}))
vi.mock('../../lib/auth', () => ({ useAuth: h.useAuth }))

beforeEach(() => {
  h.useAuth.mockReturnValue({
    signInWithMagicLink: vi.fn<() => Promise<void>>(async () => {}),
  })
})

const project = (over: Partial<Project> = {}): Project => ({
  id: 'p1',
  client_email: 'cliente@example.com',
  title: 'Sitio web para Estudio',
  type: 'web',
  amount: 1200,
  currency: 'ARS',
  status: 'en_progreso',
  start_date: '2026-09-01',
  deadline: '2026-12-01',
  description: 'Sitio institucional con blog.',
  created_at: '2026-09-01T00:00:00Z',
  updated_at: '2026-09-01T00:00:00Z',
  ...over,
})

const stage = (over: Partial<ProjectStage> = {}): ProjectStage => ({
  id: 'stage-1',
  project_id: 'p1',
  name: 'Diseño aprobado',
  description: null,
  position: 0,
  status: 'en_progreso',
  client_visible: true,
  started_at: null,
  completed_at: null,
  notes: null,
  created_at: '2026-09-05T00:00:00Z',
  ...over,
})

const payment = (over: Partial<Payment> = {}): Payment => ({
  id: 'pay-1',
  project_id: 'p1',
  kind: 'senal',
  amount: 400,
  currency: 'ARS',
  status: 'pendiente',
  due_date: null,
  paid_at: null,
  note: null,
  created_at: '2026-09-01T00:00:00Z',
  ...over,
})

function renderDetail() {
  return render(
    <MemoryRouter initialEntries={['/admin/proyectos/p1']}>
      <Routes>
        <Route path="/admin/proyectos/:id" element={<ProjectDetailPage />} />
        <Route path="/admin/proyectos" element={<p>Lista de proyectos</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

function mockDetailData() {
  h.getProject.mockResolvedValue(project())
  h.listStages.mockResolvedValue([stage()])
  h.listPayments.mockResolvedValue([payment()])
  h.listApprovals.mockResolvedValue([] satisfies MilestoneApproval[])
  h.createStage.mockResolvedValue({ id: 's-new' })
  h.updatePayment.mockResolvedValue({ id: 'pay-1' })
}

describe('ProjectDetailPage', () => {
  it('muestra loading mientras carga', () => {
    h.getProject.mockReturnValue(new Promise(() => {}))
    h.listStages.mockResolvedValue([])
    h.listPayments.mockResolvedValue([])
    h.listApprovals.mockResolvedValue([])
    renderDetail()
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('muestra error si no se puede cargar el proyecto', async () => {
    h.getProject.mockRejectedValue(new Error('boom'))
    h.listStages.mockResolvedValue([])
    h.listPayments.mockResolvedValue([])
    h.listApprovals.mockResolvedValue([])
    renderDetail()
    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('Algo salió mal. Probá de nuevo en unos minutos.')
    expect(screen.queryByText('Sitio web para Estudio')).not.toBeInTheDocument()
  })

  it('muestra el detalle completo del proyecto', async () => {
    mockDetailData()
    renderDetail()

    expect(await screen.findByText('Sitio web para Estudio')).toBeInTheDocument()
    expect(screen.getByText('cliente@example.com')).toBeInTheDocument()
    expect(screen.getAllByText('En progreso').length).toBeGreaterThan(0)
    expect(screen.getByText('Sitio web')).toBeInTheDocument()
    expect(screen.getByText('$ 1.200,00')).toBeInTheDocument()
    expect(screen.getAllByText('01/09/2026').length).toBeGreaterThan(0)
    expect(screen.getByText('01/12/2026')).toBeInTheDocument()
    expect(screen.getByText('Sitio institucional con blog.')).toBeInTheDocument()
    expect(screen.getByText('Diseño aprobado')).toBeInTheDocument()
    expect(screen.getByText('Pagos')).toBeInTheDocument()
    expect(screen.getAllByText('Seña').length).toBeGreaterThan(0)
  })

  it('envía invitación por magic link al cliente', async () => {
    const user = userEvent.setup()
    const signInWithMagicLink = vi.fn<() => Promise<void>>(async () => {})
    h.useAuth.mockReturnValue({ signInWithMagicLink })
    mockDetailData()
    renderDetail()

    await user.click(await screen.findByRole('button', { name: 'Enviar invitación' }))

    await waitFor(() => expect(signInWithMagicLink).toHaveBeenCalledWith('cliente@example.com'))
    expect(screen.getByText(/Se envió un enlace mágico/)).toBeInTheDocument()
  })

  it('avisa si falla la invitación', async () => {
    const user = userEvent.setup()
    h.useAuth.mockReturnValue({
      signInWithMagicLink: vi.fn(async () => {
        throw new Error('boom')
      }),
    })
    mockDetailData()
    renderDetail()

    await user.click(await screen.findByRole('button', { name: 'Enviar invitación' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo enviar la invitación.')
  })

  it('elimina el proyecto tras confirmar', async () => {
    const user = userEvent.setup()
    h.deleteProject.mockResolvedValue(undefined)
    mockDetailData()
    renderDetail()

    await user.click(await screen.findByRole('button', { name: 'Eliminar' }))
    await user.click(screen.getByRole('button', { name: 'Sí, eliminar' }))

    await waitFor(() => expect(h.deleteProject).toHaveBeenCalledWith('p1'))
    expect(await screen.findByText('Lista de proyectos')).toBeInTheDocument()
  })

  it('puede cancelar la eliminación', async () => {
    const user = userEvent.setup()
    mockDetailData()
    renderDetail()

    await user.click(await screen.findByRole('button', { name: 'Eliminar' }))
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(h.deleteProject).not.toHaveBeenCalled()
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })

  it('agrega una etapa y recarga el timeline', async () => {
    const user = userEvent.setup()
    mockDetailData()
    h.listStages.mockResolvedValue([])
    renderDetail()

    await user.type(await screen.findByLabelText('Nueva etapa'), 'Maquetado')
    await user.click(screen.getByRole('button', { name: 'Agregar etapa' }))

    await waitFor(() =>
      expect(h.createStage).toHaveBeenCalledWith(
        'p1',
        expect.objectContaining({ name: 'Maquetado', position: 0, client_visible: true }),
      ),
    )
  })

  it('marca un pago como pagado', async () => {
    const user = userEvent.setup()
    mockDetailData()
    renderDetail()

    await user.click(await screen.findByRole('button', { name: 'Marcar pagado' }))

    await waitFor(() =>
      expect(h.updatePayment).toHaveBeenCalledWith(
        'pay-1',
        expect.objectContaining({ status: 'pagado' }),
      ),
    )
  })
})
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ProjectDetailPage } from './ProjectDetailPage'
import type { MilestoneApproval, Project, ProjectBrief, ProjectStage } from '../../lib/types'

const h = vi.hoisted(() => ({
  getProject: vi.fn(),
  listStages: vi.fn(),
  listApprovals: vi.fn(),
  createStage: vi.fn(),
  updateStage: vi.fn(),
  deleteStage: vi.fn(),
  reorderStages: vi.fn(),
  deleteProject: vi.fn(),
  getBrief: vi.fn(),
  useAuth: vi.fn(),
}))

vi.mock('../../lib/projects', () => ({
  getProject: h.getProject,
  listStages: h.listStages,
  listApprovals: h.listApprovals,
  createStage: h.createStage,
  updateStage: h.updateStage,
  deleteStage: h.deleteStage,
  reorderStages: h.reorderStages,
  deleteProject: h.deleteProject,
}))
vi.mock('../../lib/briefs', () => ({ getBrief: h.getBrief }))
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

const brief = (over: Partial<ProjectBrief> = {}): ProjectBrief => ({
  id: 'b1',
  project_id: 'p1',
  service_type: 'institucional',
  extra_ids: ['blog', 'seo'],
  answers: { nombre: 'Estudio Contable' },
  status: 'pendiente',
  created_at: '2026-10-08T00:00:00Z',
  updated_at: '2026-10-08T00:00:00Z',
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
  h.listApprovals.mockResolvedValue([] satisfies MilestoneApproval[])
  h.getBrief.mockResolvedValue(brief())
  h.createStage.mockResolvedValue({ id: 's-new' })
}

describe('ProjectDetailPage', () => {
  it('muestra loading mientras carga', () => {
    h.getProject.mockReturnValue(new Promise(() => {}))
    h.listStages.mockResolvedValue([])
    h.listApprovals.mockResolvedValue([])
    h.getBrief.mockReturnValue(new Promise(() => {}))
    renderDetail()
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('muestra error si no se puede cargar el proyecto', async () => {
    h.getProject.mockRejectedValue(new Error('boom'))
    h.listStages.mockResolvedValue([])
    h.listApprovals.mockResolvedValue([])
    h.getBrief.mockResolvedValue(null)
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
    expect(screen.getAllByText('01/09/2026').length).toBeGreaterThan(0)
    expect(screen.getByText('01/12/2026')).toBeInTheDocument()
    expect(screen.getByText('Sitio institucional con blog.')).toBeInTheDocument()
    expect(screen.getByText('Diseño aprobado')).toBeInTheDocument()
  })

  it('no renderiza montos ni sección de pagos', async () => {
    mockDetailData()
    renderDetail()

    await screen.findByText('Sitio web para Estudio')
    expect(screen.queryByText('Monto')).not.toBeInTheDocument()
    expect(screen.queryByText('Pagos')).not.toBeInTheDocument()
    expect(screen.queryByText('Seña')).not.toBeInTheDocument()
  })

  it('muestra el resumen del brief con servicio, extras y estado', async () => {
    mockDetailData()
    renderDetail()

    const section = await screen.findByRole('region', { name: 'Brief del cliente' })
    expect(within(section).getByText('Sitio institucional')).toBeInTheDocument()
    expect(within(section).getByText('Blog / CMS editable')).toBeInTheDocument()
    expect(within(section).getByText('SEO técnico avanzado + analytics')).toBeInTheDocument()
    expect(within(section).getByText('Pendiente')).toBeInTheDocument()
    expect(within(section).getByText('Estudio Contable')).toBeInTheDocument()
  })

  it('muestra las respuestas multi-valor (chips) unidas con comas', async () => {
    mockDetailData()
    h.getBrief.mockResolvedValue(
      brief({
        answers: {
          nombre: 'Estudio Contable',
          objetivo: ['Conseguir más clientes', 'Vender online'],
        },
      }),
    )
    renderDetail()

    const section = await screen.findByRole('region', { name: 'Brief del cliente' })
    expect(within(section).getByText('Conseguir más clientes, Vender online')).toBeInTheDocument()
  })

  it('avisa cuando el proyecto todavía no tiene brief', async () => {
    mockDetailData()
    h.getBrief.mockResolvedValue(null)
    renderDetail()

    await screen.findByText('Sitio web para Estudio')
    expect(screen.getByText(/todavía no definiste el brief/i)).toBeInTheDocument()
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

  it('agrega sólo las etapas sugeridas que faltan según el brief', async () => {
    const user = userEvent.setup()
    mockDetailData()
    renderDetail()

    await user.click(await screen.findByRole('button', { name: 'Agregar etapas sugeridas' }))

    await waitFor(() => expect(h.createStage).toHaveBeenCalledTimes(9))
    expect(h.createStage).toHaveBeenCalledWith(
      'p1',
      expect.objectContaining({ name: 'Contenido de secciones' }),
    )
    expect(h.createStage).toHaveBeenCalledWith(
      'p1',
      expect.objectContaining({ name: 'Configuración del blog/CMS' }),
    )
    expect(h.createStage).not.toHaveBeenCalledWith(
      'p1',
      expect.objectContaining({ name: 'Diseño aprobado' }),
    )
    expect(screen.getByText(/Se agregaron 9 etapas sugeridas/)).toBeInTheDocument()
  })

  it('no agrega nada cuando ya están todas las etapas sugeridas', async () => {
    const user = userEvent.setup()
    mockDetailData()
    h.listStages.mockResolvedValue([
      'Relevamiento del brief',
      'Propuesta de diseño',
      'Contenido de secciones',
      'Desarrollo',
      'Revisión del cliente',
      'Ajustes finales',
      'Configuración del blog/CMS',
      'SEO técnico y analytics',
      'Publicación',
    ].map((name, index) => stage({ id: `stage-${index}`, name, position: index })))
    renderDetail()

    await user.click(await screen.findByRole('button', { name: 'Agregar etapas sugeridas' }))

    expect(screen.getByText(/Ya tenés todas las etapas sugeridas/)).toBeInTheDocument()
    expect(h.createStage).not.toHaveBeenCalled()
  })

  it('no ofrece etapas sugeridas si el proyecto no tiene brief', async () => {
    mockDetailData()
    h.getBrief.mockResolvedValue(null)
    renderDetail()

    await screen.findByText('Sitio web para Estudio')
    expect(screen.getByRole('button', { name: 'Agregar etapas sugeridas' })).toBeDisabled()
    expect(screen.getByText(/Definí el servicio y los extras/)).toBeInTheDocument()
  })
})

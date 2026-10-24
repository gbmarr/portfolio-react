import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProjectPreviewManager } from './ProjectPreviewManager'
import type { Project, ProjectPreviewWithUrl, ProjectStage } from '../../lib/types'

const h = vi.hoisted(() => ({
  updateProject: vi.fn(),
  uploadProjectPreview: vi.fn(),
  updateProjectPreview: vi.fn(),
  deleteProjectPreview: vi.fn(),
}))

vi.mock('../../lib/projects', () => ({ updateProject: h.updateProject }))
vi.mock('../../lib/previews', async () => {
  const actual = await vi.importActual<typeof import('../../lib/previews')>('../../lib/previews')
  return {
    ...actual,
    uploadProjectPreview: h.uploadProjectPreview,
    updateProjectPreview: h.updateProjectPreview,
    deleteProjectPreview: h.deleteProjectPreview,
  }
})

const project = (over: Partial<Project> = {}): Project => ({
  id: 'p1',
  client_email: 'cliente@example.com',
  title: 'Sitio web para Estudio',
  type: 'web',
  status: 'en_progreso',
  start_date: null,
  deadline: null,
  description: null,
  created_at: '2026-09-01T00:00:00Z',
  updated_at: '2026-09-01T00:00:00Z',
  completed_at: null,
  preview_url: null,
  preview_label: null,
  ...over,
})

const stage = (over: Partial<ProjectStage> = {}): ProjectStage => ({
  id: 'stage-1',
  project_id: 'p1',
  name: 'Diseño',
  description: null,
  position: 0,
  status: 'en_progreso',
  client_visible: true,
  started_at: null,
  completed_at: null,
  created_at: '2026-09-01T00:00:00Z',
  ...over,
})

const preview = (over: Partial<ProjectPreviewWithUrl> = {}): ProjectPreviewWithUrl => ({
  id: 'preview-1',
  project_id: 'p1',
  stage_id: 'stage-1',
  storage_path: 'p1/abc.png',
  caption: 'Home',
  position: 0,
  client_visible: true,
  created_at: '2026-10-24T00:00:00Z',
  url: 'https://cdn.example/preview.png',
  ...over,
})

function renderManager(over: { project?: Project; previews?: ProjectPreviewWithUrl[] } = {}) {
  const onChanged = vi.fn(async () => {})
  render(
    <ProjectPreviewManager
      project={over.project ?? project()}
      stages={[stage()]}
      previews={over.previews ?? []}
      onChanged={onChanged}
    />
  )
  return { onChanged }
}

describe('ProjectPreviewManager', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    h.updateProject.mockResolvedValue(project())
    h.uploadProjectPreview.mockResolvedValue(preview())
    h.updateProjectPreview.mockResolvedValue(preview({ client_visible: false }))
    h.deleteProjectPreview.mockResolvedValue(undefined)
  })

  it('muestra el enlace y las capturas existentes', () => {
    renderManager({
      project: project({
        preview_url: 'https://staging.example.com',
        preview_label: 'Ver staging',
      }),
      previews: [preview()],
    })

    expect(screen.getByRole('link', { name: 'Ver staging' })).toHaveAttribute(
      'href',
      'https://staging.example.com'
    )
    expect(screen.getByRole('img', { name: 'Home' })).toHaveAttribute(
      'src',
      'https://cdn.example/preview.png'
    )
    expect(screen.getByText('Etapa: Diseño')).toBeInTheDocument()
  })

  it('guarda el enlace externo normalizado', async () => {
    const user = userEvent.setup()
    const { onChanged } = renderManager()

    await user.type(screen.getByLabelText('URL del preview'), 'staging.example.com/home')
    await user.type(screen.getByLabelText('Etiqueta (opcional)'), 'Ver staging')
    await user.click(screen.getByRole('button', { name: 'Guardar enlace' }))

    await waitFor(() =>
      expect(h.updateProject).toHaveBeenCalledWith('p1', {
        preview_url: 'https://staging.example.com/home',
        preview_label: 'Ver staging',
      })
    )
    expect(await screen.findByText('Enlace guardado.')).toBeInTheDocument()
    expect(onChanged).toHaveBeenCalled()
  })

  it('muestra el error si el enlace no es HTTPS', async () => {
    const user = userEvent.setup()
    renderManager()

    await user.type(screen.getByLabelText('URL del preview'), 'http://staging.example.com')
    await user.click(screen.getByRole('button', { name: 'Guardar enlace' }))

    expect(await screen.findByText('El enlace de preview debe usar HTTPS.')).toBeInTheDocument()
    expect(h.updateProject).not.toHaveBeenCalled()
  })

  it('quita el enlace externo', async () => {
    const user = userEvent.setup()
    renderManager({ project: project({ preview_url: 'https://staging.example.com' }) })

    await user.click(screen.getByRole('button', { name: 'Quitar enlace' }))

    await waitFor(() =>
      expect(h.updateProject).toHaveBeenCalledWith('p1', {
        preview_url: null,
        preview_label: null,
      })
    )
  })

  it('sube una captura con etapa y visibilidad', async () => {
    const user = userEvent.setup()
    const { onChanged } = renderManager()
    const file = new File(['image'], 'home.png', { type: 'image/png' })

    await user.upload(screen.getByLabelText('Imagen'), file)
    await user.type(screen.getByLabelText('Epígrafe (opcional)'), 'Home')
    await user.selectOptions(screen.getByLabelText('Etapa (opcional)'), 'stage-1')
    await user.click(screen.getByLabelText('Visible para el cliente'))
    await user.click(screen.getByRole('button', { name: 'Subir captura' }))

    await waitFor(() =>
      expect(h.uploadProjectPreview).toHaveBeenCalledWith('p1', file, {
        caption: 'Home',
        stage_id: 'stage-1',
        client_visible: false,
      })
    )
    expect(await screen.findByText('Captura publicada.')).toBeInTheDocument()
    expect(onChanged).toHaveBeenCalled()
  })

  it('avisa si no se eligió una imagen', async () => {
    const user = userEvent.setup()
    renderManager()

    await user.click(screen.getByRole('button', { name: 'Subir captura' }))

    expect(await screen.findByText('Elegí una imagen para subir.')).toBeInTheDocument()
    expect(h.uploadProjectPreview).not.toHaveBeenCalled()
  })

  it('oculta una captura visible', async () => {
    const user = userEvent.setup()
    renderManager({ previews: [preview()] })

    await user.click(screen.getByRole('button', { name: 'Ocultar' }))

    await waitFor(() =>
      expect(h.updateProjectPreview).toHaveBeenCalledWith('preview-1', {
        client_visible: false,
      })
    )
  })

  it('muestra una captura oculta y permite publicarla', async () => {
    const user = userEvent.setup()
    renderManager({ previews: [preview({ client_visible: false })] })

    expect(screen.getByText('Oculta')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Mostrar' }))

    await waitFor(() =>
      expect(h.updateProjectPreview).toHaveBeenCalledWith('preview-1', {
        client_visible: true,
      })
    )
  })

  it('elimina una captura', async () => {
    const user = userEvent.setup()
    const { onChanged } = renderManager({ previews: [preview()] })

    await user.click(screen.getByRole('button', { name: 'Eliminar' }))

    await waitFor(() =>
      expect(h.deleteProjectPreview).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'preview-1', storage_path: 'p1/abc.png' })
      )
    )
    expect(onChanged).toHaveBeenCalled()
  })

  it('muestra el estado vacío', () => {
    renderManager()
    expect(screen.getByText('Todavía no hay capturas.')).toBeInTheDocument()
  })
})

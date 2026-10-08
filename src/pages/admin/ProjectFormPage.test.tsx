import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ProjectFormPage } from './ProjectFormPage'
import type { Project } from '../../lib/types'

const h = vi.hoisted(() => ({
  createProject: vi.fn(),
  updateProject: vi.fn(),
  getProject: vi.fn(),
  listClients: vi.fn(),
  getBrief: vi.fn(),
  upsertBrief: vi.fn(),
}))

vi.mock('../../lib/projects', () => ({
  createProject: h.createProject,
  updateProject: h.updateProject,
  getProject: h.getProject,
}))
vi.mock('../../lib/clients', () => ({ listClients: h.listClients }))
vi.mock('../../lib/briefs', () => ({
  getBrief: h.getBrief,
  upsertBrief: h.upsertBrief,
}))

const project = (over: Partial<Project> = {}): Project => ({
  id: 'p1',
  client_email: 'cliente@example.com',
  title: 'Sitio existente',
  type: 'web',
  status: 'lead',
  start_date: '2026-09-01',
  deadline: '2026-12-01',
  description: 'Un proyecto de prueba',
  created_at: '2026-09-01T00:00:00Z',
  updated_at: '2026-09-01T00:00:00Z',
  ...over,
})

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/admin/proyectos/nuevo" element={<ProjectFormPage />} />
        <Route path="/admin/proyectos/:id/editar" element={<ProjectFormPage />} />
        <Route path="/admin/proyectos/:id" element={<p>Detalle del proyecto</p>} />
        <Route path="/admin/proyectos" element={<p>Lista de proyectos</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ProjectFormPage', () => {
  it('muestra loading en modo edición mientras carga', () => {
    h.getProject.mockReturnValue(new Promise(() => {}))
    h.listClients.mockResolvedValue([])
    h.getBrief.mockReturnValue(new Promise(() => {}))
    renderAt('/admin/proyectos/p1/editar')
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('muestra error si falla la carga en edición', async () => {
    h.getProject.mockRejectedValue(new Error('boom'))
    h.listClients.mockResolvedValue([])
    h.getBrief.mockResolvedValue(null)
    renderAt('/admin/proyectos/p1/editar')
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Algo salió mal. Probá de nuevo en unos minutos.',
    )
  })

  it('crea un proyecto y navega al detalle', async () => {
    const user = userEvent.setup()
    h.listClients.mockResolvedValue([])
    h.createProject.mockResolvedValue({ id: 'p-new' })
    h.upsertBrief.mockResolvedValue({})
    renderAt('/admin/proyectos/nuevo')

    await user.type(screen.getByLabelText('Título'), 'Sitio para Panadería')
    await user.type(screen.getByLabelText('Email del cliente'), 'Panaderia@Example.com')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() => expect(h.createProject).toHaveBeenCalledWith({
      title: 'Sitio para Panadería',
      client_email: 'panaderia@example.com',
      type: 'web',
      status: 'lead',
      start_date: null,
      deadline: null,
      description: null,
    }))
    // El servicio por defecto es landing, sin extras.
    expect(h.upsertBrief).toHaveBeenCalledWith('p-new', 'landing', [])
    expect(await screen.findByText('Detalle del proyecto')).toBeInTheDocument()
  })

  it('valida campos obligatorios', async () => {
    const user = userEvent.setup()
    h.listClients.mockResolvedValue([])
    h.createProject.mockResolvedValue({ id: 'x' })
    renderAt('/admin/proyectos/nuevo')

    await user.click(screen.getByRole('button', { name: 'Guardar' }))
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Completá el título y el email del cliente.',
    )
    expect(h.createProject).not.toHaveBeenCalled()
  })

  it('no renderiza campos de monto', async () => {
    h.listClients.mockResolvedValue([])
    renderAt('/admin/proyectos/nuevo')

    expect(await screen.findByLabelText('Título')).toBeInTheDocument()
    expect(screen.queryByLabelText('Monto')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Moneda')).not.toBeInTheDocument()
  })

  it('precarga datos en modo edición y actualiza', async () => {
    const user = userEvent.setup()
    h.listClients.mockResolvedValue([{ email: 'otro@example.com', projectCount: 0, active: false, full_name: null }])
    h.getProject.mockResolvedValue(project())
    h.getBrief.mockResolvedValue(null)
    h.updateProject.mockResolvedValue({ id: 'p1' })
    h.upsertBrief.mockResolvedValue({})
    renderAt('/admin/proyectos/p1/editar')

    const titleInput = await screen.findByLabelText('Título')
    expect(titleInput).toHaveValue('Sitio existente')
    expect(screen.getByLabelText('Email del cliente')).toHaveValue('cliente@example.com')
    expect(screen.getByLabelText('Descripción')).toHaveValue('Un proyecto de prueba')

    await user.clear(titleInput)
    await user.type(titleInput, 'Sitio existente v2')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() =>
      expect(h.updateProject).toHaveBeenCalledWith(
        'p1',
        expect.objectContaining({ title: 'Sitio existente v2', status: 'lead' }),
      ),
    )
    expect(h.upsertBrief).toHaveBeenCalledWith('p1', 'landing', [])
  })

  it('muestra la lista de clientes conocidos como datalist', async () => {
    h.listClients.mockResolvedValue([{ email: 'cliente@example.com', projectCount: 2, active: true, full_name: null }])
    h.createProject.mockResolvedValue({ id: 'x' })
    renderAt('/admin/proyectos/nuevo')

    expect(await screen.findByLabelText('Email del cliente')).toBeInTheDocument()
    const option = document.querySelector('#known-clients option')
    expect(option).toHaveAttribute('value', 'cliente@example.com')
  })

  it('renderiza el selector de servicio y los extras', async () => {
    h.listClients.mockResolvedValue([])
    renderAt('/admin/proyectos/nuevo')

    expect(await screen.findByLabelText('Servicio')).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: /Blog \/ CMS editable/ })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: /Módulo de tienda online/ })).toBeInTheDocument()
  })

  it('envía el servicio y los extras seleccionados al crear', async () => {
    const user = userEvent.setup()
    h.listClients.mockResolvedValue([])
    h.createProject.mockResolvedValue({ id: 'p-new' })
    h.upsertBrief.mockResolvedValue({})
    renderAt('/admin/proyectos/nuevo')

    await user.type(screen.getByLabelText('Título'), 'Tienda')
    await user.type(screen.getByLabelText('Email del cliente'), 'tienda@example.com')
    await user.selectOptions(await screen.findByLabelText('Servicio'), 'medida')
    await user.click(screen.getByRole('checkbox', { name: /Blog \/ CMS editable/ }))
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() => expect(h.upsertBrief).toHaveBeenCalledWith('p-new', 'medida', ['blog']))
  })

  it('precarga el brief existente en modo edición', async () => {
    h.listClients.mockResolvedValue([])
    h.getProject.mockResolvedValue(project())
    h.getBrief.mockResolvedValue({
      id: 'b1',
      project_id: 'p1',
      service_type: 'institucional',
      extra_ids: ['seo'],
      answers: {},
      status: 'pendiente',
      created_at: '2026-10-08T00:00:00Z',
      updated_at: '2026-10-08T00:00:00Z',
    })
    renderAt('/admin/proyectos/p1/editar')

    expect(await screen.findByLabelText('Servicio')).toHaveValue('institucional')
    expect(screen.getByRole('checkbox', { name: /SEO técnico avanzado/ })).toBeChecked()
  })
})
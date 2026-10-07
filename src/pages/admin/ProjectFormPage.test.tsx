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
}))

vi.mock('../../lib/projects', () => ({
  createProject: h.createProject,
  updateProject: h.updateProject,
  getProject: h.getProject,
}))
vi.mock('../../lib/clients', () => ({ listClients: h.listClients }))

const project = (over: Partial<Project> = {}): Project => ({
  id: 'p1',
  client_email: 'cliente@example.com',
  title: 'Sitio existente',
  type: 'web',
  amount: 1200,
  currency: 'ARS',
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
    renderAt('/admin/proyectos/p1/editar')
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('muestra error si falla la carga en edición', async () => {
    h.getProject.mockRejectedValue(new Error('boom'))
    h.listClients.mockResolvedValue([])
    renderAt('/admin/proyectos/p1/editar')
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Algo salió mal. Probá de nuevo en unos minutos.',
    )
  })

  it('crea un proyecto y navega al detalle', async () => {
    const user = userEvent.setup()
    h.listClients.mockResolvedValue([])
    h.createProject.mockResolvedValue({ id: 'p-new' })
    renderAt('/admin/proyectos/nuevo')

    await user.type(screen.getByLabelText('Título'), 'Sitio para Panadería')
    await user.type(screen.getByLabelText('Email del cliente'), 'Panaderia@Example.com')
    await user.type(screen.getByLabelText('Monto'), '2500')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() => expect(h.createProject).toHaveBeenCalledWith({
      title: 'Sitio para Panadería',
      client_email: 'panaderia@example.com',
      type: 'web',
      amount: 2500,
      currency: 'ARS',
      status: 'lead',
      start_date: null,
      deadline: null,
      description: null,
    }))
    expect(await screen.findByText('Detalle del proyecto')).toBeInTheDocument()
  })

  it('valida campos obligatorios y montos negativos', async () => {
    const user = userEvent.setup()
    h.listClients.mockResolvedValue([])
    h.createProject.mockResolvedValue({ id: 'x' })
    renderAt('/admin/proyectos/nuevo')

    await user.click(screen.getByRole('button', { name: 'Guardar' }))
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Completá el título y el email del cliente.',
    )

    await user.type(screen.getByLabelText('Título'), 'Un título')
    await user.type(screen.getByLabelText('Email del cliente'), 'a@a.com')
    await user.type(screen.getByLabelText('Monto'), '-10')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))
    expect(screen.getByRole('alert')).toHaveTextContent(
      'El monto debe ser un número mayor o igual a cero.',
    )
    expect(h.createProject).not.toHaveBeenCalled()
  })

  it('precarga datos en modo edición y actualiza', async () => {
    const user = userEvent.setup()
    h.listClients.mockResolvedValue([{ email: 'otro@example.com', projectCount: 0, active: false, full_name: null }])
    h.getProject.mockResolvedValue(project())
    h.updateProject.mockResolvedValue({ id: 'p1' })
    renderAt('/admin/proyectos/p1/editar')

    const titleInput = await screen.findByLabelText('Título')
    expect(titleInput).toHaveValue('Sitio existente')
    expect(screen.getByLabelText('Email del cliente')).toHaveValue('cliente@example.com')
    expect(screen.getByLabelText('Monto')).toHaveValue(1200)
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
  })

  it('muestra la lista de clientes conocidos como datalist', async () => {
    h.listClients.mockResolvedValue([{ email: 'cliente@example.com', projectCount: 2, active: true, full_name: null }])
    h.createProject.mockResolvedValue({ id: 'x' })
    renderAt('/admin/proyectos/nuevo')

    expect(await screen.findByLabelText('Email del cliente')).toBeInTheDocument()
    const option = document.querySelector('#known-clients option')
    expect(option).toHaveAttribute('value', 'cliente@example.com')
  })
})
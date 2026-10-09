import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AdminLayout } from './AdminLayout'

const h = vi.hoisted(() => ({
  useAuth: vi.fn(),
}))

vi.mock('../../lib/auth', () => ({ useAuth: h.useAuth }))

function renderLayout() {
  return render(
    <MemoryRouter initialEntries={['/admin']}>
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<p>Contenido admin</p>} />
        </Route>
        <Route path="/login" element={<p>Login</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('AdminLayout', () => {
  it('renderiza navegación y contenido', () => {
    h.useAuth.mockReturnValue({ signOut: vi.fn() })
    renderLayout()

    expect(screen.getByText('Gestión')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Resumen' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Proyectos' })).toHaveAttribute('href', '/admin/proyectos')
    expect(screen.getByRole('link', { name: 'Clientes' })).toHaveAttribute('href', '/admin/clientes')
    expect(screen.getByRole('link', { name: 'Mensajes' })).toHaveAttribute('href', '/admin/mensajes')
    expect(screen.getByRole('link', { name: 'Ver sitio' })).toHaveAttribute('href', '/')
    expect(screen.getByText('Contenido admin')).toBeInTheDocument()
  })

  it('cierra sesión y navega al login', async () => {
    const user = userEvent.setup()
    const signOut = vi.fn<() => Promise<void>>(async () => {})
    h.useAuth.mockReturnValue({ signOut })
    renderLayout()

    await user.click(screen.getByRole('button', { name: 'Salir' }))
    expect(signOut).toHaveBeenCalled()
    expect(await screen.findByText('Login')).toBeInTheDocument()
  })

  it('navega al login incluso si el signOut falla', async () => {
    const user = userEvent.setup()
    h.useAuth.mockReturnValue({
      signOut: vi.fn(async () => {
        throw new Error('boom')
      }),
    })
    renderLayout()

    await user.click(screen.getByRole('button', { name: 'Salir' }))
    expect(await screen.findByText('Login')).toBeInTheDocument()
  })
})
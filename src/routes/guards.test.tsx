import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import type { ReactNode } from 'react'

const mocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
}))

vi.mock('../lib/auth', () => ({ useAuth: mocks.useAuth }))

import { RequireAdmin, RequireAuth, RequireClient } from './guards'

function renderGuard(guard: ReactNode, path = '/protegido') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={guard}>
          <Route path="/protegido" element={<div>contenido protegido</div>} />
        </Route>
        <Route path="/login" element={<div>pantalla-login</div>} />
        <Route path="/panel" element={<div>pantalla-panel</div>} />
        <Route path="/admin" element={<div>pantalla-admin</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('RequireAuth', () => {
  it('muestra el estado de carga mientras resuelve la sesión', () => {
    mocks.useAuth.mockReturnValue({ session: null, profile: null, loading: true })
    renderGuard(<RequireAuth />)
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.queryByText('pantalla-login')).not.toBeInTheDocument()
  })

  it('redirige a /login recordando la ruta original', () => {
    mocks.useAuth.mockReturnValue({ session: null, profile: null, loading: false })
    renderGuard(<RequireAuth />)
    expect(screen.getByText('pantalla-login')).toBeInTheDocument()
  })

  it('renderiza el contenido con sesión activa', () => {
    mocks.useAuth.mockReturnValue({ session: { user: {} }, profile: null, loading: false })
    renderGuard(<RequireAuth />)
    expect(screen.getByText('contenido protegido')).toBeInTheDocument()
  })
})

describe('RequireAdmin', () => {
  it('redirige a /login sin sesión', () => {
    mocks.useAuth.mockReturnValue({ session: null, profile: null, loading: false })
    renderGuard(<RequireAdmin />)
    expect(screen.getByText('pantalla-login')).toBeInTheDocument()
  })

  it('redirige a /panel cuando el rol es client', () => {
    mocks.useAuth.mockReturnValue({
      session: { user: {} },
      profile: { role: 'client' },
      loading: false,
    })
    renderGuard(<RequireAdmin />)
    expect(screen.getByText('pantalla-panel')).toBeInTheDocument()
  })

  it('permite el paso con rol admin', () => {
    mocks.useAuth.mockReturnValue({
      session: { user: {} },
      profile: { role: 'admin' },
      loading: false,
    })
    renderGuard(<RequireAdmin />)
    expect(screen.getByText('contenido protegido')).toBeInTheDocument()
  })

  it('muestra el estado de carga mientras resuelve', () => {
    mocks.useAuth.mockReturnValue({ session: null, profile: null, loading: true })
    renderGuard(<RequireAdmin />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })
})

describe('RequireClient', () => {
  it('redirige a /login sin sesión', () => {
    mocks.useAuth.mockReturnValue({ session: null, profile: null, loading: false })
    renderGuard(<RequireClient />)
    expect(screen.getByText('pantalla-login')).toBeInTheDocument()
  })

  it('redirige a /admin cuando el rol es admin', () => {
    mocks.useAuth.mockReturnValue({
      session: { user: {} },
      profile: { role: 'admin' },
      loading: false,
    })
    renderGuard(<RequireClient />)
    expect(screen.getByText('pantalla-admin')).toBeInTheDocument()
  })

  it('permite el paso con rol client', () => {
    mocks.useAuth.mockReturnValue({
      session: { user: {} },
      profile: { role: 'client' },
      loading: false,
    })
    renderGuard(<RequireClient />)
    expect(screen.getByText('contenido protegido')).toBeInTheDocument()
  })

  it('muestra el estado de carga mientras resuelve', () => {
    mocks.useAuth.mockReturnValue({ session: null, profile: null, loading: true })
    renderGuard(<RequireClient />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })
})

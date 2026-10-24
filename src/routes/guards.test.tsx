import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import type { ReactNode } from 'react'

const mocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
}))

vi.mock('../lib/auth-context', () => ({ useAuth: mocks.useAuth }))

import { RequireAdmin, RequireAdminMfa, RequireAuth, RequireClient } from './guards'

function renderGuard(guard: ReactNode, path = '/protegido') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={guard}>
          <Route path="/protegido" element={<div>contenido protegido</div>} />
        </Route>
        <Route path="/login" element={<div>pantalla-login</div>} />
        <Route path="/acceso-admin" element={<div>pantalla-acceso-admin</div>} />
        <Route path="/panel" element={<div>pantalla-panel</div>} />
        <Route path="/admin" element={<div>pantalla-admin</div>} />
        <Route path="/admin/mfa" element={<div>pantalla-mfa</div>} />
        <Route path="/admin/proyectos" element={<div>pantalla-proyectos</div>} />
      </Routes>
    </MemoryRouter>
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
  it('redirige al acceso de gestión (/acceso-admin) sin sesión', () => {
    mocks.useAuth.mockReturnValue({ session: null, profile: null, loading: false })
    renderGuard(<RequireAdmin />)
    expect(screen.getByText('pantalla-acceso-admin')).toBeInTheDocument()
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

  it('permite el paso con rol admin y sesión AAL2', () => {
    mocks.useAuth.mockReturnValue({
      session: { user: {} },
      profile: { role: 'admin' },
      loading: false,
      aalLevel: 'aal2',
      aalResolving: false,
    })
    renderGuard(<RequireAdmin />)
    expect(screen.getByText('contenido protegido')).toBeInTheDocument()
  })

  it('redirige a /admin/mfa cuando el admin está en AAL1 (step-up pendiente)', () => {
    mocks.useAuth.mockReturnValue({
      session: { user: {} },
      profile: { role: 'admin' },
      loading: false,
      aalLevel: 'aal1',
      aalResolving: false,
    })
    renderGuard(<RequireAdmin />)
    expect(screen.getByText('pantalla-mfa')).toBeInTheDocument()
  })

  it('muestra el estado de carga mientras se resuelve el nivel AAL', () => {
    mocks.useAuth.mockReturnValue({
      session: { user: {} },
      profile: { role: 'admin' },
      loading: false,
      aalResolving: true,
    })
    renderGuard(<RequireAdmin />)
    expect(screen.getByRole('status')).toBeInTheDocument()
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

describe('RequireAdminMfa', () => {
  // El guard renderiza la pantalla MFA como hijo: solo un render dedicado con
  // la ruta anidada puede probar el Outlet + los redireccionamientos.
  function renderMfaRoute() {
    return render(
      <MemoryRouter initialEntries={['/admin/mfa']}>
        <Routes>
          <Route element={<RequireAdminMfa />}>
            <Route path="/admin/mfa" element={<div>pantalla-mfa</div>} />
          </Route>
          <Route path="/acceso-admin" element={<div>pantalla-acceso-admin</div>} />
          <Route path="/panel" element={<div>pantalla-panel</div>} />
          <Route path="/admin" element={<div>pantalla-admin</div>} />
        </Routes>
      </MemoryRouter>
    )
  }

  it('redirige a /acceso-admin sin sesión', () => {
    mocks.useAuth.mockReturnValue({
      session: null,
      profile: null,
      loading: false,
      aalLevel: null,
      aalResolving: false,
    })
    renderMfaRoute()
    expect(screen.getByText('pantalla-acceso-admin')).toBeInTheDocument()
  })

  it('redirige a /panel cuando el rol es client', () => {
    mocks.useAuth.mockReturnValue({
      session: { user: {} },
      profile: { role: 'client' },
      loading: false,
      aalLevel: 'aal1',
      aalResolving: false,
    })
    renderMfaRoute()
    expect(screen.getByText('pantalla-panel')).toBeInTheDocument()
  })

  it('muestra la pantalla MFA cuando el admin está en AAL1', () => {
    mocks.useAuth.mockReturnValue({
      session: { user: {} },
      profile: { role: 'admin' },
      loading: false,
      aalLevel: 'aal1',
      aalResolving: false,
    })
    renderMfaRoute()
    expect(screen.getByText('pantalla-mfa')).toBeInTheDocument()
  })

  it('redirige a /admin cuando ya hay AAL2', () => {
    mocks.useAuth.mockReturnValue({
      session: { user: {} },
      profile: { role: 'admin' },
      loading: false,
      aalLevel: 'aal2',
      aalResolving: false,
    })
    renderMfaRoute()
    expect(screen.getByText('pantalla-admin')).toBeInTheDocument()
  })

  it('redirige a la ruta guardada en `from` cuando ya hay AAL2', () => {
    mocks.useAuth.mockReturnValue({
      session: { user: {} },
      profile: { role: 'admin' },
      loading: false,
      aalLevel: 'aal2',
      aalResolving: false,
    })
    render(
      <MemoryRouter
        initialEntries={[{ pathname: '/admin/mfa', state: { from: '/admin/proyectos' } }]}
      >
        <Routes>
          <Route element={<RequireAdminMfa />}>
            <Route path="/admin/mfa" element={<div>pantalla-mfa</div>} />
          </Route>
          <Route path="/admin/proyectos" element={<div>pantalla-proyectos</div>} />
        </Routes>
      </MemoryRouter>
    )
    expect(screen.getByText('pantalla-proyectos')).toBeInTheDocument()
  })

  it('muestra el estado de carga mientras se resuelve el nivel AAL', () => {
    mocks.useAuth.mockReturnValue({
      session: { user: {} },
      profile: { role: 'admin' },
      loading: false,
      aalResolving: true,
    })
    renderMfaRoute()
    expect(screen.getByRole('status')).toBeInTheDocument()
  })
})

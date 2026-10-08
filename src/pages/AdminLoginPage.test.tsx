import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

const mocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
}))

vi.mock('../lib/auth', () => ({ useAuth: mocks.useAuth }))

import { AdminLoginPage } from './AdminLoginPage'
import { panelCopy } from '../data/panel'

function renderAdminLogin() {
  return render(
    <MemoryRouter initialEntries={['/acceso-admin']}>
      <Routes>
        <Route path="/acceso-admin" element={<AdminLoginPage />} />
        <Route path="/" element={<div>home-page</div>} />
        <Route path="/login" element={<div>login-clientes</div>} />
        <Route path="/admin" element={<div>admin-page</div>} />
        <Route path="/panel" element={<div>panel-page</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

function authOverrides(overrides: Record<string, unknown> = {}) {
  mocks.useAuth.mockReturnValue({
    session: null,
    profile: null,
    loading: false,
    configured: true,
    signInWithPassword: vi.fn().mockResolvedValue(undefined),
    signInWithPasskey: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  })
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('AdminLoginPage (acceso de gestión)', () => {
  it('muestra el estado de carga', () => {
    authOverrides({ loading: true })
    renderAdminLogin()
    expect(screen.getByRole('status')).toHaveTextContent(panelCopy.loading)
  })

  it('avisa cuando Supabase no está configurado y ofrece volver al sitio', () => {
    authOverrides({ configured: false })
    renderAdminLogin()
    expect(screen.getByRole('alert')).toHaveTextContent(panelCopy.adminLogin.notConfigured)
    expect(
      screen.getByRole('link', { name: new RegExp(panelCopy.adminLogin.backToSite) }),
    ).toHaveAttribute('href', '/')
  })

  it('redirige a /admin cuando hay sesión de admin', async () => {
    authOverrides({ session: { user: { id: '1' } }, profile: { role: 'admin' } })
    renderAdminLogin()
    expect(await screen.findByText('admin-page')).toBeInTheDocument()
  })

  it('redirige a /panel cuando hay sesión de client', async () => {
    authOverrides({ session: { user: { id: '1' } }, profile: { role: 'client' } })
    renderAdminLogin()
    expect(await screen.findByText('panel-page')).toBeInTheDocument()
  })

  it('envía email y contraseña al submit', async () => {
    const signInWithPassword = vi.fn().mockResolvedValue(undefined)
    authOverrides({ signInWithPassword })
    renderAdminLogin()

    await userEvent.type(screen.getByLabelText(panelCopy.adminLogin.email), 'yo@test.com')
    await userEvent.type(screen.getByLabelText(panelCopy.adminLogin.password), 'secreta')
    await userEvent.click(screen.getByRole('button', { name: panelCopy.adminLogin.submit }))

    expect(signInWithPassword).toHaveBeenCalledWith('yo@test.com', 'secreta')
  })

  it('muestra error con credenciales inválidas', async () => {
    authOverrides({
      signInWithPassword: vi.fn().mockRejectedValue(new Error('bad')),
    })
    renderAdminLogin()

    await userEvent.type(screen.getByLabelText(panelCopy.adminLogin.email), 'yo@test.com')
    await userEvent.type(screen.getByLabelText(panelCopy.adminLogin.password), 'mala')
    await userEvent.click(screen.getByRole('button', { name: panelCopy.adminLogin.submit }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      panelCopy.adminLogin.invalidCredentials,
    )
  })

  it('oculta el botón de passkey sin WebAuthn disponible', () => {
    // jsdom no implementa PublicKeyCredential por defecto.
    authOverrides()
    renderAdminLogin()
    expect(screen.queryByRole('button', { name: panelCopy.adminLogin.passkey })).not.toBeInTheDocument()
  })

  it('entra con passkey cuando WebAuthn está disponible', async () => {
    const signInWithPasskey = vi.fn().mockResolvedValue(undefined)
    authOverrides({ signInWithPasskey })
    vi.stubGlobal('PublicKeyCredential', class {})

    renderAdminLogin()
    await userEvent.click(screen.getByRole('button', { name: panelCopy.adminLogin.passkey }))

    expect(signInWithPasskey).toHaveBeenCalledTimes(1)
  })

  it('muestra error si falla el ingreso con passkey', async () => {
    authOverrides({
      signInWithPasskey: vi.fn().mockRejectedValue(new Error('nope')),
    })
    vi.stubGlobal('PublicKeyCredential', class {})

    renderAdminLogin()
    await userEvent.click(screen.getByRole('button', { name: panelCopy.adminLogin.passkey }))

    expect(await screen.findByRole('alert')).toHaveTextContent(panelCopy.adminLogin.passkeyError)
  })
})
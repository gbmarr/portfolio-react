import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

const mocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
  turnstileOnChange: null as ((token: string) => void) | null,
}))

vi.mock('../lib/auth-context', () => ({ useAuth: mocks.useAuth }))

vi.mock('../components/Turnstile', () => ({
  TurnstileWidget: ({ onChange }: { onChange: (token: string) => void }) => {
    mocks.turnstileOnChange = onChange
    return <div data-testid="turnstile-mock" />
  },
}))

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
    </MemoryRouter>
  )
}

function authOverrides(overrides: Record<string, unknown> = {}) {
  mocks.useAuth.mockReturnValue({
    session: null,
    profile: null,
    loading: false,
    configured: true,
    signInWithPassword: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  })
}

function emitCaptcha(token = 'captcha-token') {
  act(() => mocks.turnstileOnChange?.(token))
}

beforeEach(() => {
  vi.stubEnv('PUBLIC_TURNSTILE_SITE_KEY', 'test-site-key')
  mocks.turnstileOnChange = null
})

afterEach(() => {
  vi.unstubAllEnvs()
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
      screen.getByRole('link', { name: new RegExp(panelCopy.adminLogin.backToSite) })
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

  it('envía email, contraseña y CAPTCHA al submit', async () => {
    const signInWithPassword = vi.fn().mockResolvedValue(undefined)
    authOverrides({ signInWithPassword })
    renderAdminLogin()
    emitCaptcha()

    await userEvent.type(screen.getByLabelText(panelCopy.adminLogin.email), 'yo@test.com')
    await userEvent.type(screen.getByLabelText(panelCopy.adminLogin.password), 'secreta')
    await userEvent.click(screen.getByRole('button', { name: panelCopy.adminLogin.submit }))

    expect(signInWithPassword).toHaveBeenCalledWith('yo@test.com', 'secreta', 'captcha-token')
  })

  it('muestra error con credenciales inválidas', async () => {
    authOverrides({
      signInWithPassword: vi.fn().mockRejectedValue(new Error('bad')),
    })
    renderAdminLogin()
    emitCaptcha()

    await userEvent.type(screen.getByLabelText(panelCopy.adminLogin.email), 'yo@test.com')
    await userEvent.type(screen.getByLabelText(panelCopy.adminLogin.password), 'mala')
    await userEvent.click(screen.getByRole('button', { name: panelCopy.adminLogin.submit }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      panelCopy.adminLogin.invalidCredentials
    )
  })

  it('muestra un error específico cuando falla el CAPTCHA', async () => {
    authOverrides({
      signInWithPassword: vi
        .fn()
        .mockRejectedValue(Object.assign(new Error('captcha'), { code: 'captcha_failed' })),
    })
    renderAdminLogin()
    emitCaptcha()

    await userEvent.type(screen.getByLabelText(panelCopy.adminLogin.email), 'yo@test.com')
    await userEvent.type(screen.getByLabelText(panelCopy.adminLogin.password), 'secreta')
    await userEvent.click(screen.getByRole('button', { name: panelCopy.adminLogin.submit }))

    expect(await screen.findByRole('alert')).toHaveTextContent(panelCopy.adminLogin.captchaError)
  })

  it('rechaza email inválido y contraseña vacía sin llamar al backend', async () => {
    const signInWithPassword = vi.fn()
    authOverrides({ signInWithPassword })
    renderAdminLogin()
    emitCaptcha()

    await userEvent.type(screen.getByLabelText(panelCopy.adminLogin.email), 'no-es-email')
    await userEvent.click(screen.getByRole('button', { name: panelCopy.adminLogin.submit }))
    expect(screen.getByRole('alert')).toHaveTextContent(panelCopy.adminLogin.emailInvalid)

    await userEvent.clear(screen.getByLabelText(panelCopy.adminLogin.email))
    await userEvent.type(screen.getByLabelText(panelCopy.adminLogin.email), 'yo@test.com')
    await userEvent.click(screen.getByRole('button', { name: panelCopy.adminLogin.submit }))
    expect(screen.getByRole('alert')).toHaveTextContent(panelCopy.adminLogin.passwordRequired)
    expect(signInWithPassword).not.toHaveBeenCalled()
  })

  it('mantiene el botón deshabilitado hasta completar el CAPTCHA', async () => {
    const signInWithPassword = vi.fn()
    authOverrides({ signInWithPassword })
    renderAdminLogin()

    await userEvent.type(screen.getByLabelText(panelCopy.adminLogin.email), 'yo@test.com')
    await userEvent.type(screen.getByLabelText(panelCopy.adminLogin.password), 'secreta')

    expect(screen.getByTestId('turnstile-mock')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: panelCopy.adminLogin.submit })).toBeDisabled()
    expect(signInWithPassword).not.toHaveBeenCalled()

    emitCaptcha()
    expect(screen.getByRole('button', { name: panelCopy.adminLogin.submit })).toBeEnabled()
  })

  it('oculta el botón de passkey porque el feature está desactivado', () => {
    authOverrides()
    renderAdminLogin()
    expect(screen.queryByRole('button', { name: 'passkey' })).not.toBeInTheDocument()
  })
})

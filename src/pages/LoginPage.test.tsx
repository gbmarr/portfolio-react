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

import { LoginPage } from './LoginPage'
import { panelCopy } from '../data/panel'

function renderLogin(state?: { from?: string }) {
  return render(
    <MemoryRouter initialEntries={[{ pathname: '/login', state }]}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<div>home-page</div>} />
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
    signInWithMagicLink: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  })
}

function emitCaptcha(token = 'captcha-token') {
  act(() => mocks.turnstileOnChange?.(token))
}

beforeEach(() => {
  vi.stubEnv('PUBLIC_TURNSTILE_SITE_KEY', 'test-site-key')
  window.localStorage.clear()
  mocks.turnstileOnChange = null
})

afterEach(() => {
  vi.unstubAllEnvs()
  window.localStorage.clear()
})

describe('LoginPage (cliente)', () => {
  it('muestra el estado de carga', () => {
    authOverrides({ loading: true })
    renderLogin()
    expect(screen.getByRole('status')).toHaveTextContent(panelCopy.loading)
  })

  it('avisa cuando Supabase no está configurado y ofrece volver al sitio', () => {
    authOverrides({ configured: false })
    renderLogin()
    expect(screen.getByRole('alert')).toHaveTextContent(panelCopy.login.notConfigured)
    expect(
      screen.getByRole('link', { name: new RegExp(panelCopy.login.backToSite) })
    ).toHaveAttribute('href', '/')
  })

  it('redirige a /panel cuando hay sesión de client', async () => {
    authOverrides({ session: { user: { id: '1' } }, profile: { role: 'client' } })
    renderLogin()
    expect(await screen.findByText('panel-page')).toBeInTheDocument()
  })

  it('redirige a /admin cuando hay sesión de admin', async () => {
    authOverrides({ session: { user: { id: '1' } }, profile: { role: 'admin' } })
    renderLogin()
    expect(await screen.findByText('admin-page')).toBeInTheDocument()
  })

  it('no muestra el formulario de contraseña (es exclusivo del acceso de gestión)', () => {
    authOverrides()
    renderLogin()
    expect(screen.queryByLabelText('Contraseña')).not.toBeInTheDocument()
    expect(screen.getByLabelText(panelCopy.login.email)).toBeInTheDocument()
  })

  it('pide el enlace mágico con CAPTCHA y muestra confirmación', async () => {
    const signInWithMagicLink = vi.fn().mockResolvedValue(undefined)
    authOverrides({ signInWithMagicLink })
    renderLogin()
    emitCaptcha()

    await userEvent.type(screen.getByLabelText(panelCopy.login.email), 'cliente@test.com')
    await userEvent.click(screen.getByRole('button', { name: panelCopy.login.magicLink }))

    expect(signInWithMagicLink).toHaveBeenCalledWith('cliente@test.com', 'captcha-token')
    expect(await screen.findByRole('status')).toHaveTextContent(panelCopy.login.magicSent)
    expect(screen.getByText(/Podés reenviar el enlace en \d+ s/)).toBeInTheDocument()
  })

  it('muestra la misma confirmación cuando el email no está autorizado (SEC-005)', async () => {
    const signInWithMagicLink = vi
      .fn()
      .mockRejectedValue(Object.assign(new Error('Email not found'), { code: 'user_not_found' }))
    authOverrides({ signInWithMagicLink })
    renderLogin()
    emitCaptcha()

    await userEvent.type(screen.getByLabelText(panelCopy.login.email), 'no-invitado@test.com')
    await userEvent.click(screen.getByRole('button', { name: panelCopy.login.magicLink }))

    expect(await screen.findByRole('status')).toHaveTextContent(panelCopy.login.magicSent)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('muestra error genérico ante fallos que no son user_not_found', async () => {
    const signInWithMagicLink = vi.fn().mockRejectedValue(new Error('boom'))
    authOverrides({ signInWithMagicLink })
    renderLogin()
    emitCaptcha()

    await userEvent.type(screen.getByLabelText(panelCopy.login.email), 'cliente@test.com')
    await userEvent.click(screen.getByRole('button', { name: panelCopy.login.magicLink }))

    expect(await screen.findByRole('alert')).toHaveTextContent(panelCopy.error.generic)
  })

  it('activa el cooldown y muestra el error de rate limit', async () => {
    const signInWithMagicLink = vi
      .fn()
      .mockRejectedValue(Object.assign(new Error('rate limit'), { status: 429 }))
    authOverrides({ signInWithMagicLink })
    renderLogin()
    emitCaptcha()

    await userEvent.type(screen.getByLabelText(panelCopy.login.email), 'cliente@test.com')
    await userEvent.click(screen.getByRole('button', { name: panelCopy.login.magicLink }))

    expect(await screen.findByRole('alert')).toHaveTextContent(panelCopy.login.rateLimited)
    expect(screen.getByText(/Podés reenviar el enlace en \d+ s/)).toBeInTheDocument()
  })

  it('muestra un error específico cuando falla el CAPTCHA', async () => {
    const signInWithMagicLink = vi
      .fn()
      .mockRejectedValue(Object.assign(new Error('captcha'), { code: 'captcha_failed' }))
    authOverrides({ signInWithMagicLink })
    renderLogin()
    emitCaptcha()

    await userEvent.type(screen.getByLabelText(panelCopy.login.email), 'cliente@test.com')
    await userEvent.click(screen.getByRole('button', { name: panelCopy.login.magicLink }))

    expect(await screen.findByRole('alert')).toHaveTextContent(panelCopy.login.captchaError)
  })

  it('el enlace mágico sin email muestra error y no llama al backend', async () => {
    const signInWithMagicLink = vi.fn()
    authOverrides({ signInWithMagicLink })
    renderLogin()
    emitCaptcha()

    await userEvent.click(screen.getByRole('button', { name: panelCopy.login.magicLink }))

    expect(screen.getByRole('alert')).toHaveTextContent(panelCopy.login.emailRequired)
    expect(signInWithMagicLink).not.toHaveBeenCalled()
  })

  it('rechaza un email con formato inválido sin llamar al backend', async () => {
    const signInWithMagicLink = vi.fn()
    authOverrides({ signInWithMagicLink })
    renderLogin()
    emitCaptcha()

    await userEvent.type(screen.getByLabelText(panelCopy.login.email), 'no-es-email')
    await userEvent.click(screen.getByRole('button', { name: panelCopy.login.magicLink }))

    expect(screen.getByRole('alert')).toHaveTextContent(panelCopy.login.emailInvalid)
    expect(signInWithMagicLink).not.toHaveBeenCalled()
  })

  it('mantiene el botón deshabilitado hasta completar el CAPTCHA', async () => {
    const signInWithMagicLink = vi.fn()
    authOverrides({ signInWithMagicLink })
    renderLogin()

    await userEvent.type(screen.getByLabelText(panelCopy.login.email), 'cliente@test.com')

    expect(screen.getByTestId('turnstile-mock')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: panelCopy.login.magicLink })).toBeDisabled()
    expect(signInWithMagicLink).not.toHaveBeenCalled()

    emitCaptcha()
    expect(screen.getByRole('button', { name: panelCopy.login.magicLink })).toBeEnabled()
  })
})

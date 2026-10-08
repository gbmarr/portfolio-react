import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

const mocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
}))

vi.mock('../lib/auth', () => ({ useAuth: mocks.useAuth }))

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
    </MemoryRouter>,
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
    expect(screen.getByRole('link', { name: new RegExp(panelCopy.login.backToSite) })).toHaveAttribute(
      'href',
      '/',
    )
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

  it('pide el enlace mágico y muestra confirmación', async () => {
    const signInWithMagicLink = vi.fn().mockResolvedValue(undefined)
    authOverrides({ signInWithMagicLink })
    renderLogin()

    await userEvent.type(screen.getByLabelText(panelCopy.login.email), 'cliente@test.com')
    await userEvent.click(screen.getByRole('button', { name: panelCopy.login.magicLink }))

    expect(signInWithMagicLink).toHaveBeenCalledWith('cliente@test.com')
    expect(await screen.findByRole('status')).toHaveTextContent(panelCopy.login.magicSent)
  })

  it('el enlace mágico sin email muestra error y no llama al backend', async () => {
    const signInWithMagicLink = vi.fn()
    authOverrides({ signInWithMagicLink })
    renderLogin()

    await userEvent.click(screen.getByRole('button', { name: panelCopy.login.magicLink }))

    expect(screen.getByRole('alert')).toHaveTextContent(panelCopy.login.emailRequired)
    expect(signInWithMagicLink).not.toHaveBeenCalled()
  })
})
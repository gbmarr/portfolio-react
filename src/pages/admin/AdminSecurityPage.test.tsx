import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const h = vi.hoisted(() => ({
  useAuth: vi.fn(),
}))

vi.mock('../../lib/auth', () => ({ useAuth: h.useAuth }))

import { AdminSecurityPage } from './AdminSecurityPage'
import { panelCopy } from '../../data/panel'

const passkeyFixture = (over: Partial<{ id: string; friendly_name: string; created_at: string }> = {}) => ({
  id: 'pk-1',
  friendly_name: 'Notebook',
  created_at: '2026-09-05T00:00:00',
  last_used_at: null,
  ...over,
})

function defaultAuth(over: Record<string, unknown> = {}) {
  h.useAuth.mockReturnValue({
    passkeys: [],
    registerPasskey: vi.fn(async () => {}),
    deletePasskey: vi.fn(async () => {}),
    ...over,
  })
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('AdminSecurityPage', () => {
  it('muestra el estado de carga mientras las passkeys no llegan', () => {
    defaultAuth({ passkeys: null })
    render(<AdminSecurityPage />)
    expect(screen.getByRole('status')).toHaveTextContent(panelCopy.loading)
  })

  it('lista las passkeys registradas con fecha', () => {
    defaultAuth({ passkeys: [passkeyFixture()] })
    render(<AdminSecurityPage />)

    expect(screen.getByText('Notebook')).toBeInTheDocument()
    expect(screen.getByText(/Registrada el/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: panelCopy.security.delete })).toBeInTheDocument()
  })

  it('muestra el estado vacío sin passkeys', () => {
    defaultAuth()
    render(<AdminSecurityPage />)
    expect(screen.getByText(panelCopy.security.listEmpty)).toBeInTheDocument()
  })

  it('registra una passkey y avisa', async () => {
    const user = userEvent.setup()
    const registerPasskey = vi.fn(async () => {})
    defaultAuth({ registerPasskey })

    render(<AdminSecurityPage />)
    await user.click(screen.getByRole('button', { name: panelCopy.security.register }))

    expect(registerPasskey).toHaveBeenCalledTimes(1)
    expect(await screen.findByRole('status')).toHaveTextContent(panelCopy.security.registered)
  })

  it('avisa si falla el registro', async () => {
    const user = userEvent.setup()
    defaultAuth({
      registerPasskey: vi.fn(async () => {
        throw new Error('boom')
      }),
    })

    render(<AdminSecurityPage />)
    await user.click(screen.getByRole('button', { name: panelCopy.security.register }))

    expect(await screen.findByRole('alert')).toHaveTextContent(panelCopy.security.registerError)
  })

  it('elimina una passkey y avisa', async () => {
    const user = userEvent.setup()
    const deletePasskey = vi.fn(async () => {})
    defaultAuth({ passkeys: [passkeyFixture()], deletePasskey })

    render(<AdminSecurityPage />)
    await user.click(screen.getByRole('button', { name: panelCopy.security.delete }))

    expect(deletePasskey).toHaveBeenCalledWith('pk-1')
    expect(await screen.findByRole('status')).toHaveTextContent(panelCopy.security.deleted)
  })

  it('avisa si falla la eliminación', async () => {
    const user = userEvent.setup()
    defaultAuth({
      passkeys: [passkeyFixture()],
      deletePasskey: vi.fn(async () => {
        throw new Error('boom')
      }),
    })

    render(<AdminSecurityPage />)
    await user.click(screen.getByRole('button', { name: panelCopy.security.delete }))

    expect(await screen.findByRole('alert')).toHaveTextContent(panelCopy.security.deleteError)
  })
})
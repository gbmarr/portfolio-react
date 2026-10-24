import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ClientsPage } from './ClientsPage'
import type { ClientRow } from '../../lib/clients'

const h = vi.hoisted(() => ({
  listClients: vi.fn(),
  useAuth: vi.fn(),
}))

vi.mock('../../lib/clients', () => ({ listClients: h.listClients }))
vi.mock('../../lib/auth-context', () => ({ useAuth: h.useAuth }))

beforeEach(() => {
  h.useAuth.mockReturnValue({
    inviteByMagicLink: vi.fn<() => Promise<void>>(async () => {}),
  })
})

const client = (over: Partial<ClientRow> = {}): ClientRow => ({
  email: 'c@example.com',
  full_name: null,
  projectCount: 1,
  active: false,
  ...over,
})

function renderPage() {
  return render(<ClientsPage />)
}

describe('ClientsPage', () => {
  it('muestra loading mientras carga', () => {
    h.listClients.mockReturnValue(new Promise(() => {}))
    renderPage()
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('muestra error si falla la carga', async () => {
    h.listClients.mockRejectedValue(new Error('boom'))
    renderPage()
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Algo salió mal. Probá de nuevo en unos minutos.'
    )
  })

  it('muestra estado vacío', async () => {
    h.listClients.mockResolvedValue([])
    renderPage()
    expect(await screen.findByText(/Todavía no hay clientes/)).toBeInTheDocument()
  })

  it('distingue clientes activos de pendientes', async () => {
    h.listClients.mockResolvedValue([
      client(),
      client({
        email: 'activo@example.com',
        active: true,
        full_name: 'Ana Pérez',
        projectCount: 3,
      }),
    ])
    renderPage()

    expect(await screen.findByText('c@example.com')).toBeInTheDocument()
    expect(screen.getByText('Por activar')).toBeInTheDocument()
    expect(screen.getByText('Ana Pérez')).toBeInTheDocument()
    expect(screen.getByText('Activo')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Invitar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reenviar enlace' })).toBeInTheDocument()
  })

  it('envía la invitación por magic link', async () => {
    const user = userEvent.setup()
    const inviteByMagicLink = vi.fn<() => Promise<void>>(async () => {})
    h.useAuth.mockReturnValue({ inviteByMagicLink })
    h.listClients.mockResolvedValue([client({ email: 'nuevo@example.com' })])

    renderPage()

    const inviteButton = await screen.findByRole('button', { name: 'Invitar' })
    await user.click(inviteButton)

    await waitFor(() => expect(inviteByMagicLink).toHaveBeenCalledWith('nuevo@example.com'))
    expect(await screen.findByText('Invitación enviada ✓')).toBeInTheDocument()
  })

  it('permite reenviar la invitación a clientes ya activos', async () => {
    const user = userEvent.setup()
    const inviteByMagicLink = vi.fn<() => Promise<void>>(async () => {})
    h.useAuth.mockReturnValue({ inviteByMagicLink })
    h.listClients.mockResolvedValue([client({ email: 'a@example.com', active: true })])

    renderPage()

    const resendButton = await screen.findByRole('button', { name: 'Reenviar enlace' })
    await user.click(resendButton)

    await waitFor(() => expect(inviteByMagicLink).toHaveBeenCalledWith('a@example.com'))
    expect(await screen.findByText('Invitación enviada ✓')).toBeInTheDocument()
  })

  it('avisa si falla la invitación', async () => {
    const user = userEvent.setup()
    h.useAuth.mockReturnValue({
      inviteByMagicLink: vi.fn(async () => {
        throw new Error('boom')
      }),
    })
    h.listClients.mockResolvedValue([client({ email: 'falla@example.com' })])

    renderPage()

    await user.click(await screen.findByRole('button', { name: 'Invitar' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No se pudo enviar la invitación a falla@example.com.'
    )
  })
})

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
vi.mock('../../lib/auth', () => ({ useAuth: h.useAuth }))

beforeEach(() => {
  h.useAuth.mockReturnValue({
    signInWithMagicLink: vi.fn<() => Promise<void>>(async () => {}),
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
      'Algo salió mal. Probá de nuevo en unos minutos.',
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
      client({ email: 'activo@example.com', active: true, full_name: 'Ana Pérez', projectCount: 3 }),
    ])
    renderPage()

    expect(await screen.findByText('c@example.com')).toBeInTheDocument()
    expect(screen.getByText('Por activar')).toBeInTheDocument()
    expect(screen.getByText('Ana Pérez')).toBeInTheDocument()
    expect(screen.getByText('Activo')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('envía la invitación por magic link', async () => {
    const user = userEvent.setup()
    const signInWithMagicLink = vi.fn<() => Promise<void>>(async () => {})
    h.useAuth.mockReturnValue({ signInWithMagicLink })
    h.listClients.mockResolvedValue([client({ email: 'nuevo@example.com' })])

    renderPage()

    const inviteButton = await screen.findByRole('button', { name: 'Invitar' })
    await user.click(inviteButton)

    await waitFor(() => expect(signInWithMagicLink).toHaveBeenCalledWith('nuevo@example.com'))
    expect(await screen.findByText('Invitación enviada ✓')).toBeInTheDocument()
  })

  it('no muestra botón para clientes ya activos', async () => {
    h.listClients.mockResolvedValue([client({ email: 'a@example.com', active: true })])
    renderPage()
    expect(await screen.findByText('a@example.com')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Invitar' })).not.toBeInTheDocument()
  })

  it('avisa si falla la invitación', async () => {
    const user = userEvent.setup()
    h.useAuth.mockReturnValue({
      signInWithMagicLink: vi.fn(async () => {
        throw new Error('boom')
      }),
    })
    h.listClients.mockResolvedValue([client({ email: 'falla@example.com' })])

    renderPage()

    await user.click(await screen.findByRole('button', { name: 'Invitar' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No se pudo enviar la invitación a falla@example.com.',
    )
  })
})
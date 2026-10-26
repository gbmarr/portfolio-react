import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ClientsPage } from './ClientsPage'
import type { ClientRow } from '../../lib/clients'

const h = vi.hoisted(() => ({
  listClients: vi.fn(),
}))

vi.mock('../../lib/clients', () => ({ listClients: h.listClients }))

vi.mock('./InviteClientDialog', () => ({
  InviteClientDialog: ({
    email,
    onSent,
    onClose,
  }: {
    email: string
    onSent: (email: string) => void
    onClose: () => void
  }) => (
    <div>
      <p>invite-dialog:{email}</p>
      <button
        type="button"
        onClick={() => {
          onSent(email)
          onClose()
        }}
      >
        Confirmar invitación
      </button>
    </div>
  ),
}))

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

  it('abre el diálogo de invitación y marca el envío', async () => {
    const user = userEvent.setup()
    h.listClients.mockResolvedValue([client({ email: 'nuevo@example.com' })])

    renderPage()

    await user.click(await screen.findByRole('button', { name: 'Invitar' }))
    expect(screen.getByText('invite-dialog:nuevo@example.com')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Confirmar invitación' }))

    expect(await screen.findByText('Invitación enviada ✓')).toBeInTheDocument()
    expect(screen.queryByText('invite-dialog:nuevo@example.com')).not.toBeInTheDocument()
  })

  it('permite reenviar la invitación a clientes ya activos', async () => {
    const user = userEvent.setup()
    h.listClients.mockResolvedValue([client({ email: 'a@example.com', active: true })])

    renderPage()

    await user.click(await screen.findByRole('button', { name: 'Reenviar enlace' }))
    expect(screen.getByText('invite-dialog:a@example.com')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Confirmar invitación' }))

    expect(await screen.findByText('Invitación enviada ✓')).toBeInTheDocument()
  })
})

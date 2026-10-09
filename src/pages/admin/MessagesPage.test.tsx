import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MessagesPage } from './MessagesPage'
import type { ContactMessage } from '../../lib/types'

const h = vi.hoisted(() => ({
  listMessages: vi.fn(),
  markMessageRead: vi.fn(),
  deleteMessage: vi.fn(),
}))

vi.mock('../../lib/messages', () => ({
  listMessages: h.listMessages,
  markMessageRead: h.markMessageRead,
  deleteMessage: h.deleteMessage,
}))

const message = (over: Partial<ContactMessage> = {}): ContactMessage => ({
  id: 'm1',
  name: 'Ana López',
  email: 'ana@example.com',
  message: 'Hola, quiero un sitio para mi tienda.',
  subject: 'Consulta por sitio',
  read_at: null,
  created_at: '2026-09-01T12:30:00Z',
  ...over,
})

function renderPage() {
  return render(<MessagesPage />)
}

describe('MessagesPage', () => {
  it('muestra loading mientras carga', () => {
    h.listMessages.mockReturnValue(new Promise(() => {}))
    renderPage()
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('muestra error si falla la carga', async () => {
    h.listMessages.mockRejectedValue(new Error('boom'))
    renderPage()
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Algo salió mal. Probá de nuevo en unos minutos.',
    )
  })

  it('muestra estado vacío', async () => {
    h.listMessages.mockResolvedValue([])
    renderPage()
    expect(await screen.findByText(/No hay mensajes todavía/)).toBeInTheDocument()
  })

  it('lista mensajes con contador de no leídos', async () => {
    h.listMessages.mockResolvedValue([
      message(),
      message({ id: 'm2', read_at: '2026-09-02T00:00:00Z', name: 'Leo Gómez', subject: 'Otra consulta' }),
    ])
    renderPage()

    expect(await screen.findByText('Ana López')).toBeInTheDocument()
    expect(screen.getByText('Leo Gómez')).toBeInTheDocument()
    expect(screen.getByText('Consulta por sitio')).toBeInTheDocument()
    expect(screen.getByText('1 sin leer')).toBeInTheDocument()
  })

  it('expande un mensaje y muestra el cuerpo con mailto', async () => {
    const user = userEvent.setup()
    h.listMessages.mockResolvedValue([message()])
    renderPage()

    await user.click(await screen.findByText('Ana López'))

    expect(screen.getByText(/quiero un sitio/i)).toBeInTheDocument()
    const reply = screen.getByRole('link', { name: /Responder por email/ })
    expect(reply).toHaveAttribute('href', expect.stringContaining('mailto:ana@example.com'))
    expect(reply).toHaveAttribute('href', expect.stringContaining(encodeURIComponent('Re: Consulta por sitio')))
  })

  it('no genera un link mailto para un email con caracteres peligrosos', async () => {
    const user = userEvent.setup()
    h.listMessages.mockResolvedValue([
      message({ email: 'victim@example.com%0d%0abcc:attacker@example.com' }),
    ])
    renderPage()

    await user.click(await screen.findByText('Ana López'))

    expect(screen.queryByRole('link', { name: /Responder por email/ })).not.toBeInTheDocument()
    expect(
      screen.getByText('victim@example.com%0d%0abcc:attacker@example.com'),
    ).toBeInTheDocument()
  })

  it('marca leído y actualiza el contador', async () => {
    const user = userEvent.setup()
    h.markMessageRead.mockResolvedValue({ data: null, error: null })
    h.listMessages
      .mockResolvedValueOnce([message()])
      .mockResolvedValueOnce([message({ read_at: '2026-09-03T00:00:00Z' })])
    renderPage()

    await user.click(await screen.findByText('Ana López'))
    await user.click(screen.getByRole('button', { name: 'Marcar leído' }))

    await waitFor(() => expect(h.markMessageRead).toHaveBeenCalledWith('m1', true))
    expect(await screen.findByText('0 sin leer')).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: 'Marcar no leído' })).toBeInTheDocument()
  })

  it('elimina un mensaje', async () => {
    const user = userEvent.setup()
    h.deleteMessage.mockResolvedValue({ data: null, error: null })
    h.listMessages.mockResolvedValueOnce([message()]).mockResolvedValueOnce([])
    renderPage()

    await user.click(await screen.findByText('Ana López'))
    await user.click(screen.getByRole('button', { name: 'Eliminar' }))

    await waitFor(() => expect(h.deleteMessage).toHaveBeenCalledWith('m1'))
    expect(await screen.findByText(/No hay mensajes todavía/)).toBeInTheDocument()
  })

  it('avisa si falla una acción', async () => {
    const user = userEvent.setup()
    h.markMessageRead.mockRejectedValue(new Error('boom'))
    h.listMessages.mockResolvedValue([message()])
    renderPage()

    await user.click(await screen.findByText('Ana López'))
    await user.click(screen.getByRole('button', { name: 'Marcar leído' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo actualizar el mensaje.')
  })
})
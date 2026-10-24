import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QuoteRequestsPage } from './QuoteRequestsPage'
import type { QuoteRequest } from '../../lib/types'

const h = vi.hoisted(() => ({
  listQuoteRequests: vi.fn(),
  updateQuoteRequestStatus: vi.fn(),
  deleteQuoteRequest: vi.fn(),
}))

vi.mock('../../lib/quoteRequests', () => ({
  listQuoteRequests: h.listQuoteRequests,
  updateQuoteRequestStatus: h.updateQuoteRequestStatus,
  deleteQuoteRequest: h.deleteQuoteRequest,
}))

const request = (over: Partial<QuoteRequest> = {}): QuoteRequest => ({
  id: 'q1',
  name: 'Ana López',
  email: 'ana@example.com',
  tier: 'institucional',
  sections: 5,
  extras: ['blog', 'logo'],
  notes: 'Quiero sumar un blog y el logo.',
  consent_at: '2026-10-24T12:00:00Z',
  consent_version: '2026-10-24',
  status: 'new',
  created_at: '2026-10-24T12:00:00Z',
  contacted_at: null,
  ...over,
})

function renderPage() {
  return render(<QuoteRequestsPage />)
}

beforeEach(() => {
  h.listQuoteRequests.mockReset()
  h.updateQuoteRequestStatus.mockReset()
  h.deleteQuoteRequest.mockReset()
})

describe('QuoteRequestsPage', () => {
  it('muestra loading mientras carga', () => {
    h.listQuoteRequests.mockReturnValue(new Promise(() => {}))
    renderPage()
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('muestra error si falla la carga', async () => {
    h.listQuoteRequests.mockRejectedValue(new Error('boom'))
    renderPage()
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Algo salió mal. Probá de nuevo en unos minutos.'
    )
  })

  it('muestra estado vacío', async () => {
    h.listQuoteRequests.mockResolvedValue([])
    renderPage()
    expect(await screen.findByText(/No hay solicitudes todavía/)).toBeInTheDocument()
  })

  it('lista solicitudes con contador de nuevas y estado', async () => {
    h.listQuoteRequests.mockResolvedValue([
      request(),
      request({ id: 'q2', name: 'Leo Gómez', status: 'contacted', contacted_at: '2026-10-24T13:00:00Z' }),
    ])
    renderPage()

    expect(await screen.findByText('Ana López')).toBeInTheDocument()
    expect(screen.getByText('Leo Gómez')).toBeInTheDocument()
    expect(screen.getByText('1 nuevas')).toBeInTheDocument()
    expect(screen.getByText('Nuevo')).toBeInTheDocument()
    expect(screen.getByText('Contactado')).toBeInTheDocument()
  })

  it('expande una solicitud y muestra el brief sin montos', async () => {
    const user = userEvent.setup()
    h.listQuoteRequests.mockResolvedValue([request()])
    renderPage()

    await user.click(await screen.findByText('Ana López'))

    expect(screen.getByText('ana@example.com')).toBeInTheDocument()
    expect(screen.getByText('Sitio completo')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('Blog / CMS editable, Diseño de logo / identidad')).toBeInTheDocument()
    expect(screen.getByText('Quiero sumar un blog y el logo.')).toBeInTheDocument()
    expect(screen.getByText(/v2026-10-24/)).toBeInTheDocument()
    expect(screen.queryByText(/USD|ARS|\$/)).not.toBeInTheDocument()

    const reply = screen.getByRole('link', { name: 'Contactar por email' })
    expect(reply).toHaveAttribute('href', expect.stringContaining('mailto:ana@example.com'))
    expect(reply).toHaveAttribute(
      'href',
      expect.stringContaining(encodeURIComponent('Presupuesto — Sitio completo — Ana López'))
    )
  })

  it('marca una solicitud como contactada', async () => {
    const user = userEvent.setup()
    h.updateQuoteRequestStatus.mockResolvedValue(undefined)
    h.listQuoteRequests
      .mockResolvedValueOnce([request()])
      .mockResolvedValueOnce([
        request({ status: 'contacted', contacted_at: '2026-10-24T13:00:00Z' }),
      ])
    renderPage()

    await user.click(await screen.findByText('Ana López'))
    await user.click(screen.getByRole('button', { name: 'Marcar contactado' }))

    await waitFor(() => expect(h.updateQuoteRequestStatus).toHaveBeenCalledWith('q1', 'contacted'))
    expect(await screen.findByText('Contactado')).toBeInTheDocument()
  })

  it('cierra y reabre una solicitud', async () => {
    const user = userEvent.setup()
    h.updateQuoteRequestStatus.mockResolvedValue(undefined)
    h.listQuoteRequests
      .mockResolvedValueOnce([request({ status: 'contacted' })])
      .mockResolvedValueOnce([request({ status: 'closed' })])
    renderPage()

    await user.click(await screen.findByText('Ana López'))
    await user.click(screen.getByRole('button', { name: 'Cerrar' }))
    await waitFor(() => expect(h.updateQuoteRequestStatus).toHaveBeenCalledWith('q1', 'closed'))

    await user.click(await screen.findByRole('button', { name: 'Reabrir' }))
    await waitFor(() => expect(h.updateQuoteRequestStatus).toHaveBeenCalledWith('q1', 'new'))
  })

  it('elimina una solicitud', async () => {
    const user = userEvent.setup()
    h.deleteQuoteRequest.mockResolvedValue(undefined)
    h.listQuoteRequests.mockResolvedValueOnce([request()]).mockResolvedValueOnce([])
    renderPage()

    await user.click(await screen.findByText('Ana López'))
    await user.click(screen.getByRole('button', { name: 'Eliminar' }))

    await waitFor(() => expect(h.deleteQuoteRequest).toHaveBeenCalledWith('q1'))
    expect(await screen.findByText(/No hay solicitudes todavía/)).toBeInTheDocument()
  })

  it('avisa si falla una acción', async () => {
    const user = userEvent.setup()
    h.updateQuoteRequestStatus.mockRejectedValue(new Error('boom'))
    h.listQuoteRequests.mockResolvedValue([request()])
    renderPage()

    await user.click(await screen.findByText('Ana López'))
    await user.click(screen.getByRole('button', { name: 'Marcar contactado' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No se pudo actualizar la solicitud.'
    )
  })

  it('no genera un link mailto para un email con caracteres peligrosos', async () => {
    const user = userEvent.setup()
    h.listQuoteRequests.mockResolvedValue([
      request({ email: 'victim@example.com%0d%0abcc:attacker@example.com' }),
    ])
    renderPage()

    await user.click(await screen.findByText('Ana López'))

    expect(screen.queryByRole('link', { name: 'Contactar por email' })).not.toBeInTheDocument()
    expect(
      screen.getAllByText('victim@example.com%0d%0abcc:attacker@example.com').length
    ).toBeGreaterThan(0)
  })
})

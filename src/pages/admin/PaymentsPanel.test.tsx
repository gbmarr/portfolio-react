import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PaymentsPanel } from './PaymentsPanel'
import type { Payment } from '../../lib/types'

const payment = (over: Partial<Payment> = {}): Payment => ({
  id: 'pay-1',
  project_id: 'p1',
  kind: 'senal',
  amount: 1000,
  currency: 'ARS',
  status: 'pendiente',
  due_date: '2026-11-01',
  paid_at: null,
  note: null,
  created_at: '2026-01-01T00:00:00Z',
  ...over,
})

const props = {
  payments: [payment()],
  onAdd: vi.fn<() => Promise<void>>(async () => {}),
  onTogglePaid: vi.fn<() => Promise<void>>(async () => {}),
  onDelete: vi.fn<() => Promise<void>>(async () => {}),
}

function renderPanel(over: Partial<typeof props> = {}) {
  return render(<PaymentsPanel {...props} {...over} />)
}

describe('PaymentsPanel', () => {
  it('lista los pagos con tipo, monto y estado', () => {
    renderPanel({
      payments: [
        payment(),
        payment({ id: 'p2', kind: 'saldo', amount: 2500, status: 'pagado', paid_at: '2026-02-01T00:00:00Z' }),
      ],
    })
    const listItems = screen.getAllByRole('listitem')
    expect(listItems).toHaveLength(2)
    expect(screen.getAllByText('Seña').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Saldo').length).toBeGreaterThan(0)
    expect(screen.getByText('Pagado')).toBeInTheDocument()
  })

  it('muestra totales cobrado y pendiente', () => {
    renderPanel({
      payments: [
        payment({ amount: 1000, status: 'pendiente' }),
        payment({ id: 'p2', amount: 2000, status: 'pagado', paid_at: '2026-02-01T00:00:00Z' }),
      ],
    })
    const totals = within(screen.getByTestId('payments-totals'))
    expect(totals.getByText('$ 2.000,00', { exact: false })).toBeInTheDocument()
    expect(totals.getByText('$ 1.000,00', { exact: false })).toBeInTheDocument()
  })

  it('agrega un pago por el formulario', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn<() => Promise<void>>(async () => {})
    renderPanel({ onAdd })

    await user.type(screen.getByLabelText('Monto'), '500')
    await user.click(screen.getByRole('button', { name: 'Agregar pago' }))

    await waitFor(() =>
      expect(onAdd).toHaveBeenCalledWith({
        kind: 'senal',
        amount: 500,
        currency: 'ARS',
        status: 'pendiente',
        due_date: null,
        paid_at: null,
        note: null,
      }),
    )
    expect(screen.getByLabelText('Monto')).toHaveValue(null)
  })

  it('rechaza montos inválidos', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn<() => Promise<void>>(async () => {})
    renderPanel({ onAdd })

    await user.type(screen.getByLabelText('Monto'), '0')
    await user.click(screen.getByRole('button', { name: 'Agregar pago' }))
    expect(onAdd).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent('El monto debe ser mayor a cero.')
  })

  it('avisa si falla al agregar', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn<() => Promise<void>>(async () => {
      throw new Error('boom')
    })
    renderPanel({ onAdd })

    await user.type(screen.getByLabelText('Monto'), '100')
    await user.click(screen.getByRole('button', { name: 'Agregar pago' }))
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('No se pudo agregar el pago.'))
  })

  it('alterna pagado/pendiente', async () => {
    const user = userEvent.setup()
    const onTogglePaid = vi.fn<() => Promise<void>>(async () => {})
    renderPanel({ onTogglePaid })

    await user.click(screen.getByRole('button', { name: 'Marcar pagado' }))
    expect(onTogglePaid).toHaveBeenCalledWith(expect.objectContaining({ id: 'pay-1' }))
  })

  it('elimina un pago', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn<() => Promise<void>>(async () => {})
    renderPanel({ onDelete })

    await user.click(screen.getByRole('button', { name: 'Eliminar pago Seña' }))
    expect(onDelete).toHaveBeenCalledWith(expect.objectContaining({ id: 'pay-1' }))
  })
})
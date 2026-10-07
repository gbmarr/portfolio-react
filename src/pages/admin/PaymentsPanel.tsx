import { useState, type FormEvent } from 'react'
import { Badge } from '../../components/ui/Badge'
import { FormField } from '../../components/ui/FormField'
import { SelectField } from '../../components/ui/SelectField'
import { formatDate, formatMoney } from '../../lib/format'
import { statusLabels, statusTones } from '../../data/panel'
import type { Currency, Payment, PaymentInput, PaymentKind } from '../../lib/types'

const kindOptions = (
  Object.entries(statusLabels.paymentKind) as Array<[PaymentKind, string]>
).map(([value, label]) => ({ value, label }))

const currencyOptions = [
  { value: 'ARS', label: 'ARS' },
  { value: 'USD', label: 'USD' },
]

export type PaymentsPanelProps = {
  payments: Payment[]
  onAdd: (input: Omit<PaymentInput, 'project_id'>) => Promise<void>
  onTogglePaid: (payment: Payment) => Promise<void>
  onDelete: (payment: Payment) => Promise<void>
}

/** Sección de pagos del detalle de proyecto (solo admin). */
export function PaymentsPanel({ payments, onAdd, onTogglePaid, onDelete }: PaymentsPanelProps) {
  const [kind, setKind] = useState<PaymentKind>('senal')
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState<Currency>('ARS')
  const [dueDate, setDueDate] = useState('')
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const value = Number(amount)
    if (Number.isNaN(value) || value <= 0) {
      setError('El monto debe ser mayor a cero.')
      return
    }
    setAdding(true)
    setError(null)
    try {
      await onAdd({
        kind,
        amount: value,
        currency,
        status: 'pendiente',
        due_date: dueDate || null,
        paid_at: null,
        note: null,
      })
      setAmount('')
      setDueDate('')
    } catch {
      setError('No se pudo agregar el pago.')
    } finally {
      setAdding(false)
    }
  }

  async function handleToggle(payment: Payment) {
    try {
      await onTogglePaid(payment)
    } catch {
      setError('No se pudo actualizar el pago.')
    }
  }

  async function handleDelete(payment: Payment) {
    try {
      await onDelete(payment)
    } catch {
      setError('No se pudo eliminar el pago.')
    }
  }

  const paid = payments
    .filter((payment) => payment.status === 'pagado')
    .reduce((total, payment) => total + Number(payment.amount), 0)
  const pending = payments
    .filter((payment) => payment.status !== 'pagado')
    .reduce((total, payment) => total + Number(payment.amount), 0)
  const currencyOfFirst = payments[0]?.currency ?? 'ARS'

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted">Pagos</h2>
        <p data-testid="payments-totals" className="text-sm text-text-muted">
          <span className="text-emerald-300">{formatMoney(paid, currencyOfFirst)}</span> cobrado ·{' '}
          <span className="text-amber-300">{formatMoney(pending, currencyOfFirst)}</span> pendiente
        </p>
      </div>

      {payments.length > 0 && (
        <ul className="space-y-2">
          {payments.map((payment) => (
            <li
              key={payment.id}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-background/60 px-4 py-3 text-sm"
            >
              <span className="font-medium text-text">{statusLabels.paymentKind[payment.kind]}</span>
              <span className="text-text-muted">{formatMoney(Number(payment.amount), payment.currency)}</span>
              <Badge tone={statusTones.payment[payment.status]}>
                {statusLabels.payment[payment.status]}
              </Badge>
              {payment.due_date && (
                <span className="text-xs text-text-muted">Vence {formatDate(payment.due_date)}</span>
              )}
              <div className="ml-auto flex gap-2">
                <button
                  type="button"
                  onClick={() => handleToggle(payment)}
                  className="rounded border border-border px-2 py-1 text-xs text-text-muted hover:border-accent hover:text-accent"
                >
                  {payment.status === 'pagado' ? 'Marcar pendiente' : 'Marcar pagado'}
                </button>
                <button
                  type="button"
                  aria-label={`Eliminar pago ${statusLabels.paymentKind[payment.kind]}`}
                  onClick={() => handleDelete(payment)}
                  className="rounded border border-border px-2 py-1 text-xs text-text-muted hover:border-red-400 hover:text-red-300"
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-3">
        <div className="w-32">
          <SelectField
            id="payment-kind"
            label="Tipo"
            hideLabel
            value={kind}
            onValueChange={(value) => setKind(value as PaymentKind)}
            options={kindOptions}
          />
        </div>
        <div className="w-36">
          <FormField
            id="payment-amount"
            label="Monto"
            type="number"
            min="0"
            step="0.01"
            placeholder="Monto"
            value={amount}
            onValueChange={setAmount}
          />
        </div>
        <div className="w-28">
          <SelectField
            id="payment-currency"
            label="Moneda"
            hideLabel
            value={currency}
            onValueChange={(value) => setCurrency(value as Currency)}
            options={currencyOptions}
          />
        </div>
        <div className="w-40">
          <FormField
            id="payment-due"
            label="Vencimiento"
            type="date"
            value={dueDate}
            onValueChange={setDueDate}
          />
        </div>
        <button
          type="submit"
          disabled={adding}
          className="rounded-full border border-border px-5 py-3 text-sm font-medium text-text transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-60"
        >
          Agregar pago
        </button>
      </form>

      {error && (
        <p role="alert" className="rounded-lg border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}
    </div>
  )
}

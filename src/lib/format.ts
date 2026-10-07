import type { Currency } from './types'

/** Formato monetario es-AR, ej. "$ 1.500,00" / "US$ 1.500,00". */
export function formatMoney(amount: number, currency: Currency): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount)
}

/** Fecha legible es-AR, ej. "05/10/2026". Acepta 'YYYY-MM-DD' o ISO completo. */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  const date = iso.length === 10 ? new Date(`${iso}T00:00:00`) : new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(
    date,
  )
}

/** Fecha y hora es-AR para timestamps, ej. "05/10/2026 14:30". */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

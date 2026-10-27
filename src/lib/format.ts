/** Zona horaria oficial del sistema. */
export const APP_TIME_ZONE = 'America/Argentina/Buenos_Aires'

const DATE_ONLY_RE = /^(\d{4})-(\d{2})-(\d{2})$/

const dateFormatter = new Intl.DateTimeFormat('es-AR', {
  timeZone: APP_TIME_ZONE,
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

const dateTimeFormatter = new Intl.DateTimeFormat('es-AR', {
  timeZone: APP_TIME_ZONE,
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

const dateKeyFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: APP_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

/** Parsea 'YYYY-MM-DD' como fecha de calendario, sin depender de la zona del runtime. */
function parseDateOnly(iso: string): Date | null {
  const match = DATE_ONLY_RE.exec(iso)
  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  // Mediodía UTC: al formatear en Argentina sigue siendo el mismo día calendario.
  const date = new Date(Date.UTC(year, month - 1, day, 12))

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null
  }

  return date
}

/** Fecha legible es-AR, ej. "05/10/2026". Acepta 'YYYY-MM-DD' o ISO completo. */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  const date = DATE_ONLY_RE.test(iso) ? parseDateOnly(iso) : new Date(iso)
  if (!date || Number.isNaN(date.getTime())) return '—'
  return dateFormatter.format(date)
}

/** Fecha y hora es-AR para timestamps, ej. "05/10/2026 14:30". */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return dateTimeFormatter.format(date)
}

/** Clave de calendario argentina (YYYY-MM-DD) para un instante. */
export function argentinaDateKey(date: Date = new Date()): string {
  const parts = dateKeyFormatter.formatToParts(date)
  const get = (type: 'year' | 'month' | 'day') =>
    parts.find((part) => part.type === type)?.value ?? ''
  return `${get('year')}-${get('month')}-${get('day')}`
}

/** Año calendario argentino para un instante. */
export function argentinaYear(date: Date = new Date()): number {
  return Number(argentinaDateKey(date).slice(0, 4))
}

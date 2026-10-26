/**
 * Contrato único de solicitud de presupuesto, compartido por el cliente y la
 * Edge Function `contact-notify`.
 *
 * Es un módulo PURO: no importa Deno ni React. Por eso se testea con Vitest y
 * resuelve igual en Vite (bundler) y en Deno (import relativo con `.ts`).
 *
 * La solicitud NO contiene precios: guarda qué necesita el usuario para que el
 * owner responda manualmente con un presupuesto personalizado.
 */
import { EMAIL_PATTERN, hasControlChars } from './contact-contract.ts'

export const QUOTE_TIER_IDS = ['landing', 'institucional', 'medida'] as const
export type QuoteTierId = (typeof QUOTE_TIER_IDS)[number]

export const QUOTE_EXTRA_IDS = [
  'blog',
  'integraciones',
  'multidioma',
  'logo',
  'copy',
  'ecommerce',
  'seo',
] as const
export type QuoteExtraId = (typeof QUOTE_EXTRA_IDS)[number]

/** Extras que el usuario puede tildar para cada tier. */
export const QUOTE_SELECTABLE_EXTRAS: Record<QuoteTierId, readonly QuoteExtraId[]> = {
  landing: ['integraciones', 'multidioma', 'logo', 'copy', 'seo'],
  institucional: ['blog', 'integraciones', 'multidioma', 'logo', 'copy', 'seo'],
  medida: ['blog', 'integraciones', 'multidioma', 'logo', 'copy', 'seo'],
}

/** Extras que vienen incluidos en el tier (no se tildan, pero forman parte del alcance). */
export const QUOTE_INCLUDED_EXTRAS: Record<QuoteTierId, readonly QuoteExtraId[]> = {
  landing: [],
  institucional: [],
  medida: ['ecommerce'],
}

export const QUOTE_SECTIONS = { min: 3, max: 8 } as const

export const QUOTE_LIMITS = {
  nameMax: 80,
  emailMax: 120,
  notesMax: 1000,
  maxExtras: 20,
} as const

/** Versión del consentimiento informado. Cambiarla cuando cambie el texto legal. */
export const QUOTE_CONSENT_VERSION = '2026-10-24'

/** Acción esperada en el token de Turnstile para el formulario de presupuesto. */
export const TURNSTILE_ACTION_QUOTE = 'quote'

export interface QuoteFields {
  name: string
  email: string
  tier: string
  sections: number
  extras: string[]
  notes: string
  consentAccepted: boolean
  consentVersion: string
}

export interface QuotePayload extends QuoteFields {
  kind: 'quote'
  turnstileToken: string
}

export type QuoteValidationReason =
  | 'name'
  | 'email'
  | 'tier'
  | 'sections'
  | 'extras'
  | 'notes'
  | 'consent'
  | 'turnstile'

export type QuoteValidation =
  | { ok: true }
  | { ok: false; reason: QuoteValidationReason }

export function isQuoteTierId(value: string): value is QuoteTierId {
  return (QUOTE_TIER_IDS as readonly string[]).includes(value)
}

export function isQuoteExtraId(value: string): value is QuoteExtraId {
  return (QUOTE_EXTRA_IDS as readonly string[]).includes(value)
}

/**
 * Caracteres de control inseguros en texto libre. Las notas sí pueden tener
 * saltos de línea y tabs; lo que se rechaza es NUL, ESC y controles raros que
 * no tienen sentido en un textarea.
 */
function hasUnsafeControlChars(value: string): boolean {
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i)
    if (code === 0x0a || code === 0x0d || code === 0x09) continue
    if (code < 0x20 || code === 0x7f) return true
  }
  return false
}

/** Secciones normalizadas: solo el tier institucional usa el slider 3–8. */
export function normalizeQuoteSections(tier: QuoteTierId, sections: number): number {
  if (tier !== 'institucional') return 0
  return Math.min(Math.max(Math.trunc(sections) || QUOTE_SECTIONS.min, QUOTE_SECTIONS.min), QUOTE_SECTIONS.max)
}

/**
 * Extras normalizados: únicos, conocidos y válidos para el tier. En `medida`
 * se agrega `ecommerce` porque viene incluido en el alcance.
 */
export function normalizeQuoteExtras(tier: QuoteTierId, extras: string[]): QuoteExtraId[] {
  const allowed = new Set<string>([
    ...QUOTE_SELECTABLE_EXTRAS[tier],
    ...QUOTE_INCLUDED_EXTRAS[tier],
  ])
  const normalized: QuoteExtraId[] = []
  for (const id of extras) {
    if (!isQuoteExtraId(id) || !allowed.has(id) || normalized.includes(id)) continue
    normalized.push(id)
  }
  if (tier === 'medida' && !normalized.includes('ecommerce')) normalized.push('ecommerce')
  return normalized
}

/** Valida los campos de una solicitud, sin exigir el token de Turnstile. */
export function validateQuoteFields(fields: QuoteFields): QuoteValidation {
  const name = fields.name.trim()
  const email = fields.email.trim()
  const notes = fields.notes.trim()

  if (!name || name.length > QUOTE_LIMITS.nameMax || hasControlChars(name)) {
    return { ok: false, reason: 'name' }
  }
  if (
    !email ||
    email.length > QUOTE_LIMITS.emailMax ||
    hasControlChars(email) ||
    !EMAIL_PATTERN.test(email) ||
    email.includes('..')
  ) {
    return { ok: false, reason: 'email' }
  }
  const emailParts = email.split('@')
  if (emailParts.length !== 2) return { ok: false, reason: 'email' }
  const [quoteLocal, quoteDomain] = emailParts
  if (quoteLocal.length === 0 || quoteLocal.startsWith('.') || quoteLocal.endsWith('.'))
    return { ok: false, reason: 'email' }
  const quoteDomainParts = quoteDomain.split('.')
  if (quoteDomainParts.length < 2) return { ok: false, reason: 'email' }
  const quoteTld = quoteDomainParts[quoteDomainParts.length - 1]
  if (!/^[A-Za-z]{2,63}$/.test(quoteTld) || /^\d+$/.test(quoteTld)) return { ok: false, reason: 'email' }
  for (const part of quoteDomainParts) {
    if (part.length === 0 || part.startsWith('-') || part.endsWith('-')) return { ok: false, reason: 'email' }
    if (!/^[A-Za-z0-9-]+$/.test(part)) return { ok: false, reason: 'email' }
  }
  if (!isQuoteTierId(fields.tier)) return { ok: false, reason: 'tier' }

  if (fields.tier === 'institucional') {
    if (
      !Number.isInteger(fields.sections) ||
      fields.sections < QUOTE_SECTIONS.min ||
      fields.sections > QUOTE_SECTIONS.max
    ) {
      return { ok: false, reason: 'sections' }
    }
  } else if (fields.sections !== 0) {
    return { ok: false, reason: 'sections' }
  }

  if (!Array.isArray(fields.extras) || fields.extras.length > QUOTE_LIMITS.maxExtras) {
    return { ok: false, reason: 'extras' }
  }
  const allowed = new Set<string>([
    ...QUOTE_SELECTABLE_EXTRAS[fields.tier],
    ...QUOTE_INCLUDED_EXTRAS[fields.tier],
  ])
  const seen = new Set<string>()
  for (const id of fields.extras) {
    if (typeof id !== 'string' || !isQuoteExtraId(id) || !allowed.has(id) || seen.has(id)) {
      return { ok: false, reason: 'extras' }
    }
    seen.add(id)
  }

  if (notes.length > QUOTE_LIMITS.notesMax || hasUnsafeControlChars(notes)) {
    return { ok: false, reason: 'notes' }
  }
  if (!fields.consentAccepted || fields.consentVersion !== QUOTE_CONSENT_VERSION) {
    return { ok: false, reason: 'consent' }
  }

  return { ok: true }
}

/** Valida un payload completo antes de enviarlo a la función. */
export function validateQuotePayload(payload: QuotePayload): QuoteValidation {
  const fields = validateQuoteFields(payload)
  if (!fields.ok) return fields
  if (!payload.turnstileToken.trim()) return { ok: false, reason: 'turnstile' }
  return { ok: true }
}

/** Construye el payload recortando y normalizando los campos. */
export function buildQuotePayload(
  fields: QuoteFields,
  turnstileToken: string
): QuotePayload {
  const tier = isQuoteTierId(fields.tier) ? fields.tier : 'landing'
  return {
    kind: 'quote',
    name: fields.name.trim(),
    email: fields.email.trim(),
    tier,
    sections: normalizeQuoteSections(tier, fields.sections),
    extras: normalizeQuoteExtras(tier, fields.extras),
    notes: fields.notes.trim(),
    consentAccepted: fields.consentAccepted,
    consentVersion: QUOTE_CONSENT_VERSION,
    turnstileToken: turnstileToken.trim(),
  }
}

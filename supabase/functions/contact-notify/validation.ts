// SEC-005: validación de contenido del formulario de contacto.
//
// `name` y `email` son input no confiable y terminan en headers del email
// (`subject` y `reply_to`). Un valor con caracteres de control (CR/LF/NUL)
// permitiría inyección de headers (CRLF injection). Esta validación corre
// SIEMPRE server-side (la Edge Function), independientemente del cliente.
//
// Módulo puro (sin imports de Deno) para poder testearlo con Vitest.
// Es importado desde `./index.ts` de la Edge Function contact-notify.

// Los límites, `hasControlChars`, el patrón de email y `TURNSTILE_ACTION` viven
// en el contrato compartido con el cliente (un solo lugar para la política).
import { CONTACT_LIMITS, hasControlChars } from '../_shared/contact-contract.ts'

export interface ContactPayload {
  name: string
  email: string
  message: string
  turnstileToken: string
}

export type ContactValidationReason = 'name' | 'email' | 'message' | 'turnstile'

export type ContactValidation =
  { ok: true; payload: ContactPayload } | { ok: false; reason: ContactValidationReason }

/**
 * SEC-007: blocklist de dominios de email desechables. Es una mitigación de
 * ruido (anti-spam), NO un control de seguridad: es evadible y conscientemente
 * NO es un allowlist de proveedores (eso rompería el modo "email o WhatsApp" y
 * daría falsos positivos con dominios corporativos/ISP).
 */
export const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'mailinator.com',
  'guerrillamail.com',
  'guerrillamail.info',
  'sharklasers.com',
  '10minutemail.com',
  'tempmail.com',
  'temp-mail.org',
  'throwawaymail.com',
  'yopmail.com',
  'trashmail.com',
  'getnada.com',
  'dispostable.com',
])

/**
 * true si el valor parece un email de un dominio desechable. No aplica a
 * teléfonos/WhatsApp (sin `@`), por lo que nunca bloquea esa vía.
 */
export function isDisposableEmail(value: string): boolean {
  const at = value.lastIndexOf('@')
  if (at === -1) return false
  const domain = value
    .slice(at + 1)
    .trim()
    .toLowerCase()
  return DISPOSABLE_EMAIL_DOMAINS.has(domain)
}

export interface TurnstileVerifyResponse {
  success?: boolean
  hostname?: string
  action?: string
}

export interface TurnstileExpectations {
  /** Hostnames desde los que se acepta el token (el sitio + localhost en dev). */
  allowedHostnames: readonly string[]
  /** Acción que debe traer el token (evita reutilizar tokens de otro widget). */
  expectedAction: string
}

/**
 * SEC-006: valida la respuesta completa de `siteverify`. Además de `success`,
 * exige que el token provenga de la acción esperada y, si Cloudflare informa
 * `hostname`, que sea uno de los permitidos.
 */
export function isTurnstileResponseValid(
  data: TurnstileVerifyResponse,
  expectations: TurnstileExpectations
): boolean {
  if (data.success !== true) return false
  if (data.action !== expectations.expectedAction) return false
  if (data.hostname && !expectations.allowedHostnames.includes(data.hostname)) {
    return false
  }
  return true
}

/**
 * Valida y normaliza (recortando) el payload de contacto.
 *
 * - Rechaza caracteres de control en `name`/`email` (SEC-005: defensa contra
 *   inyección de headers); `message` puede contener saltos de línea legítimos.
 * - NO exige formato de email: el campo acepta "email o WhatsApp" por diseño.
 */
export function validateContactInput(raw: Partial<ContactPayload>): ContactValidation {
  const name = typeof raw.name === 'string' ? raw.name.trim() : ''
  const email = typeof raw.email === 'string' ? raw.email.trim() : ''
  const message = typeof raw.message === 'string' ? raw.message.trim() : ''
  const turnstileToken = typeof raw.turnstileToken === 'string' ? raw.turnstileToken.trim() : ''

  if (!name || name.length > CONTACT_LIMITS.nameMax || hasControlChars(name)) {
    return { ok: false, reason: 'name' }
  }
  if (!email || email.length > CONTACT_LIMITS.emailMax || hasControlChars(email)) {
    return { ok: false, reason: 'email' }
  }
  // SEC-007: blocklist de dominios desechables (solo si hay `@`; nunca bloquea
  // teléfono/WhatsApp). Filtro anti-ruido, no control de autoridad.
  if (isDisposableEmail(email)) {
    return { ok: false, reason: 'email' }
  }
  if (
    !message ||
    message.length < CONTACT_LIMITS.messageMin ||
    message.length > CONTACT_LIMITS.messageMax
  ) {
    return { ok: false, reason: 'message' }
  }
  if (!turnstileToken) return { ok: false, reason: 'turnstile' }
  return { ok: true, payload: { name, email, message, turnstileToken } }
}

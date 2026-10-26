/**
 * Contrato único de contacto, compartido por el cliente (`src/`) y la Edge
 * Function `contact-notify`.
 *
 * Es un módulo PURO: no importa Deno ni React, así que se testea con Vitest y
 * resuelve igual en Vite (bundler) y en Deno (import relativo con `.ts`). Sus
 * dos consumidores son adapters reales de la misma política —el navegador y la
 * Edge Function—, por eso el seam está justificado.
 *
 * Espejo en SQL: la migración `0015_client_email_valid.sql` copia
 * `EMAIL_PATTERN` dentro de `public.is_valid_email(text)` porque la base no
 * puede importar TS. Ese espejo se mantiene sincronizado a mano.
 */

/** Límites de longitud del formulario de contacto. */
export const CONTACT_LIMITS = {
  nameMax: 80,
  emailMax: 120,
  messageMin: 10,
  messageMax: 2000,
} as const

/** true si el valor contiene caracteres de control (CR/LF/NUL, etc.). */
export function hasControlChars(value: string): boolean {
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i)
    if (code < 0x20 || code === 0x7f) return true
  }
  return false
}

/**
 * Email estructuralmente válido y seguro para `mailto:`/`reply_to`: sin
 * caracteres de control ni delimitadores de header (`?`, `&`, `%`, `,`, `:`).
 * Sin flag `g`, por lo que compartir una única instancia es seguro.
 */
export const EMAIL_PATTERN = /^[A-Za-z0-9._+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,63}$/

/** true si el valor (recortado) es un email apto para `mailto:`/`reply_to`. */
export function isValidEmailStrict(value: string): boolean {
  const email = value.trim()
  if (email.length === 0 || email.length > CONTACT_LIMITS.emailMax) return false
  if (hasControlChars(email)) return false
  if (!EMAIL_PATTERN.test(email)) return false
  if (email.includes('..')) return false
  const parts = email.split('@')
  if (parts.length !== 2) return false
  const [localPart, domain] = parts
  if (localPart.length === 0 || localPart.startsWith('.') || localPart.endsWith('.')) return false
  const domainParts = domain.split('.')
  if (domainParts.length < 2) return false
  const tld = domainParts[domainParts.length - 1]
  if (!/^[A-Za-z]{2,63}$/.test(tld)) return false
  if (/^\d+$/.test(tld)) return false
  for (const part of domainParts) {
    if (part.length === 0) return false
    if (part.startsWith('-') || part.endsWith('-')) return false
    if (!/^[A-Za-z0-9-]+$/.test(part)) return false
  }
  return true
}

export function isSafeEmail(value: string): boolean {
  return isValidEmailStrict(value)
}

/** SEC-006: acción esperada en el token de Turnstile (widget y `siteverify`). */
export const TURNSTILE_ACTION = 'contact'

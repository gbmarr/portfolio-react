import type { ContactFormData } from '../components/ContactForm'
import { CONTACT_LIMITS, hasControlChars } from '../shared/contact-contract'

/** Payload que recibe la Edge Function `contact-notify`. */
export interface ContactPayload {
  name: string
  email: string
  message: string
  turnstileToken: string
}

export type ContactValidationReason = 'name' | 'email' | 'message' | 'turnstile'

export type ContactValidation = { ok: true } | { ok: false; reason: ContactValidationReason }

/**
 * Valida los campos del formulario (nombre/email/mensaje), sin exigir el token
 * de Turnstile. Es la política de campos que comparten el guard temprano del
 * formulario y la validación previa al envío.
 */
export function validateContactFields(data: ContactFormData): ContactValidation {
  const name = data.name.trim()
  const email = data.email.trim()
  const message = data.message.trim()

  // SEC-005: `name`/`email` van a headers del email; se rechazan caracteres de
  // control (CR/LF/NUL) también del lado cliente, en paridad con el servidor.
  if (!name || name.length > CONTACT_LIMITS.nameMax || hasControlChars(name))
    return { ok: false, reason: 'name' }
  if (!email || email.length > CONTACT_LIMITS.emailMax || hasControlChars(email))
    return { ok: false, reason: 'email' }
  if (message.length < CONTACT_LIMITS.messageMin || message.length > CONTACT_LIMITS.messageMax)
    return { ok: false, reason: 'message' }
  return { ok: true }
}

/** Valida (recortando) un payload antes de enviarlo a la función. */
export function validateContactPayload(payload: ContactPayload): ContactValidation {
  const fields = validateContactFields(payload)
  if (!fields.ok) return fields
  if (!payload.turnstileToken.trim()) return { ok: false, reason: 'turnstile' }
  return { ok: true }
}

/** Construye el payload recortando los campos del formulario. */
export function buildContactPayload(data: ContactFormData, turnstileToken: string): ContactPayload {
  return {
    name: data.name.trim(),
    email: data.email.trim(),
    message: data.message.trim(),
    turnstileToken: turnstileToken.trim(),
  }
}

/**
 * URL de la Edge Function `contact-notify`, derivada de PUBLIC_SUPABASE_URL:
 * `https://<ref>.supabase.co` → `https://<ref>.functions.supabase.co/contact-notify`.
 * Devuelve null si PUBLIC_SUPABASE_URL no está configurada o no parece un proyecto Supabase.
 */
export function contactFunctionUrl(): string | null {
  const url = import.meta.env.PUBLIC_SUPABASE_URL
  if (!url) return null
  const match = url.match(/^https:\/\/([a-z0-9-]+)\.supabase\.co\/?/)
  return match ? `https://${match[1]}.functions.supabase.co/contact-notify` : null
}

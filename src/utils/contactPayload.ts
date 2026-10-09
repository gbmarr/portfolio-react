import type { ContactFormData } from '../components/ContactForm'

/** Payload que recibe la Edge Function `contact-notify`. */
export interface ContactPayload {
  name: string
  email: string
  message: string
  turnstileToken: string
}

/** Límites compartidos con la validación server-side de la función. */
export const CONTACT_LIMITS = {
  nameMax: 80,
  emailMax: 120,
  messageMin: 10,
  messageMax: 2000,
} as const

export type ContactValidation =
  | { ok: true }
  | { ok: false; reason: 'name' | 'email' | 'message' | 'turnstile' }

/** Valida (recortando) un payload antes de enviarlo a la función. */
export function validateContactPayload(payload: ContactPayload): ContactValidation {
  const name = payload.name.trim()
  const email = payload.email.trim()
  const message = payload.message.trim()

  if (!name || name.length > CONTACT_LIMITS.nameMax) return { ok: false, reason: 'name' }
  if (!email || email.length > CONTACT_LIMITS.emailMax) return { ok: false, reason: 'email' }
  if (message.length < CONTACT_LIMITS.messageMin || message.length > CONTACT_LIMITS.messageMax)
    return { ok: false, reason: 'message' }
  if (!payload.turnstileToken.trim()) return { ok: false, reason: 'turnstile' }
  return { ok: true }
}

/** Construye el payload recortando los campos del formulario. */
export function buildContactPayload(
  data: ContactFormData,
  turnstileToken: string,
): ContactPayload {
  return {
    name: data.name.trim(),
    email: data.email.trim(),
    message: data.message.trim(),
    turnstileToken: turnstileToken.trim(),
  }
}

/**
 * URL de la Edge Function `contact-notify`, derivada de DATABASE_URL:
 * `https://<ref>.supabase.co` → `https://<ref>.functions.supabase.co/contact-notify`.
 * Devuelve null si DATABASE_URL no está configurada o no parece un proyecto Supabase.
 */
export function contactFunctionUrl(): string | null {
  const url = import.meta.env.DATABASE_URL
  if (!url) return null
  const match = url.match(/^https:\/\/([a-z0-9-]+)\.supabase\.co\/?/)
  return match ? `https://${match[1]}.functions.supabase.co/contact-notify` : null
}
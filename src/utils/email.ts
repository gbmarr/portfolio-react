/**
 * Validación de email del cliente (RT-02).
 *
 * Espeja el patrón SAFE_EMAIL de la Edge Function `contact-notify`
 * (supabase/functions/contact-notify/validation.ts) para mantener un criterio
 * único y conservador. No verifica entregabilidad (fuera de alcance).
 */

const EMAIL_RE = /^[A-Za-z0-9._+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/

/** Normaliza un email para la tenancy por email: recorta y pasa a minúsculas. */
export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase()
}

/** Valida la estructura de un email (criterio conservador, sin entregabilidad). */
export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim())
}
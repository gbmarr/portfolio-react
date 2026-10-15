/**
 * Validación de email del cliente (RT-02).
 *
 * Usa el patrón estructural del contrato compartido con la Edge Function
 * (`supabase/functions/_shared/contact-contract.ts`) para mantener un criterio
 * único y conservador. No verifica entregabilidad (fuera de alcance).
 */

import { EMAIL_PATTERN } from '../shared/contact-contract'

/** Normaliza un email para la tenancy por email: recorta y pasa a minúsculas. */
export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase()
}

/** Valida la estructura de un email (criterio conservador, sin entregabilidad). */
export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim())
}

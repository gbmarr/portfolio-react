/**
 * Utilidades para tratar valores de contacto (email/WhatsApp) con seguridad.
 *
 * El campo del formulario público acepta "email o WhatsApp", por eso no se exige
 * formato de email al enviar: el valor se neutraliza en el punto de uso (el href
 * `mailto:` del panel), donde un valor que no es email simplemente no genera
 * enlace y nunca llega crudo a la URI.
 *
 * `hasControlChars` y el patrón de email viven en el contrato compartido con la
 * Edge Function (`supabase/functions/_shared/contact-contract.ts`).
 */

import { EMAIL_PATTERN, hasControlChars } from '../../supabase/functions/_shared/contact-contract'

/**
 * Devuelve la dirección solo si es un email seguro para `mailto:`; si no, `null`.
 * Rechaza valores con `?`, `&`, `%`, `,`, `:`, CR/LF o que no sean un email
 * (p. ej. un teléfono), para que no inyecten parámetros ni headers.
 */
export function safeMailtoAddress(value: string): string | null {
  const trimmed = value.trim()
  if (trimmed.length === 0 || hasControlChars(trimmed)) return null
  return EMAIL_PATTERN.test(trimmed) ? trimmed : null
}

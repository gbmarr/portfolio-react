/**
 * Utilidades para tratar valores de contacto (email/WhatsApp) con seguridad.
 *
 * El campo del formulario público acepta "email o WhatsApp", por eso no se exige
 * formato de email al enviar: el valor se neutraliza en el punto de uso (el href
 * `mailto:` del panel), donde un valor que no es email simplemente no genera
 * enlace y nunca llega crudo a la URI.
 */

/** true si el valor contiene caracteres de control (CR/LF/NUL, etc.). */
export function hasControlChars(value: string): boolean {
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i)
    if (code < 0x20 || code === 0x7f) return true
  }
  return false
}

/** Email "seguro" para un href `mailto:`: sin control chars ni delimitadores. */
const SAFE_EMAIL = /^[A-Za-z0-9._+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/

/**
 * Devuelve la dirección solo si es un email seguro para `mailto:`; si no, `null`.
 * Rechaza valores con `?`, `&`, `%`, `,`, `:`, CR/LF o que no sean un email
 * (p. ej. un teléfono), para que no inyecten parámetros ni headers.
 */
export function safeMailtoAddress(value: string): string | null {
  const trimmed = value.trim()
  if (trimmed.length === 0 || hasControlChars(trimmed)) return null
  return SAFE_EMAIL.test(trimmed) ? trimmed : null
}

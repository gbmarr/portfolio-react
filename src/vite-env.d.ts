/// <reference types="vite/client" />

// Estas variables se inlinean en el bundle del cliente (envPrefix en
// vite.config.ts): son públicas por diseño. No agregar secretos aquí.
interface ImportMetaEnv {
  readonly PUBLIC_SUPABASE_URL?: string
  readonly PUBLIC_SUPABASE_PUBLISHABLE_KEY?: string
  readonly PUBLIC_TURNSTILE_SITE_KEY?: string
  /** Cotización USD→ARS del estimador (pública por diseño; fallback 1400). */
  readonly PUBLIC_ARS_RATE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

/// <reference types="vite/client" />

// Estas variables se inlinean en el bundle del cliente (envPrefix en
// vite.config.ts): son públicas por diseño. No agregar secretos aquí.
interface ImportMetaEnv {
  readonly DATABASE_URL?: string
  readonly DATABASE_PUBLISHABLE_KEY?: string
  readonly TURNSTILE_SITE_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
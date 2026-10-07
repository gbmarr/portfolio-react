/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly FORM_ACCESS_KEY?: string
  readonly DATABASE_URL?: string
  readonly DATABASE_PUBLISHABLE_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
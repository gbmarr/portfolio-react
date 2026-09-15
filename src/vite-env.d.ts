/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly FORM_ACCESS_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
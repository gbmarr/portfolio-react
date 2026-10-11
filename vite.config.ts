import { defineConfig } from 'vite'
import { configDefaults } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // envPrefix inlinea en el bundle del cliente SOLO las variables que
  // empiezan con PUBLIC_ (convención segura por diseño: ningún secreto usa ese
  // prefijo). Antes eran DATABASE_/ARS_/TURNSTILE_: cualquier secreto con esos
  // prefijos (ej. TURNSTILE_SECRET si se definía en el build) se habría
  // inlineado al cliente. La protección real del formulario es Turnstile
  // (verificación server-side) + las políticas RLS de Supabase, no el secreto.
  envPrefix: ['PUBLIC_'],
  test: {
    environment: 'jsdom',
    // Vitest 5: 'vmThreads' reutiliza una instancia jsdom por worker manteniendo
    // aislamiento por archivo (verificado contra doc oficial v5.0.3). Antes se
    // creaban 67 instancias jsdom (~98s); con este pool se usa 1 por worker.
    pool: 'vmThreads',
    setupFiles: ['./src/test/setup.ts'],
    // `.agents/` contiene skills/scripts ajenos al repo (no versionados) que
    // Vitest levanta como si fueran suites. Los excluimos del test run.
    exclude: [...configDefaults.exclude, '.agents/**'],
    coverage: {
      provider: 'v8',
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
})

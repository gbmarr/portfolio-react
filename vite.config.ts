import { defineConfig } from 'vite'
import { configDefaults } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // envPrefix inlinea en el bundle del cliente toda variable FORM_* o DATABASE_*
  // (sin prefijo VITE_ para evitar el warning de "public vars" de Vercel).
  // SOLO valores públicos pueden usar estos prefijos; la protección real es el
  // honeypot/validación del form y las políticas RLS de Supabase, no el secreto.
  // Un prefijo explícito `PUBLIC_*` reemplazará esta convención (follow-up D4).
  envPrefix: ['FORM_', 'DATABASE_'],
  test: {
    environment: 'jsdom',
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

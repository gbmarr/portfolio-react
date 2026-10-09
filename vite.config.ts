import { defineConfig } from 'vite'
import { configDefaults } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Solo se expone FORM_ACCESS_KEY a import.meta.env (sin prefijo VITE_ para
  // evitar el warning de "public vars" de Vercel). Web3Forms usa una key
  // semipública de cliente; la protección real es el honeypot del form.
  // DATABASE_URL / DATABASE_PUBLISHABLE_KEY (Supabase) también son públicas
  // por diseño: la protección real son las políticas RLS de la base.
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

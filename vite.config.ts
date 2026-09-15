/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Solo se expone FORM_ACCESS_KEY a import.meta.env (sin prefijo VITE_ para
  // evitar el warning de "public vars" de Vercel). Web3Forms usa una key
  // semipública de cliente; la protección real es el honeypot del form.
  envPrefix: ['FORM_'],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
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

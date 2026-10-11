# Plan: Higiene de configuración de seguridad

> **Track ID:** `sec_config_hygiene_20261011`
> **Spec:** [./spec.md](./spec.md)
> **Status:** 🧪 En implementación (código listo; pendiente deploy + rename env en hosts)

---

## Fase 1 — Config

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T1.1 | Declarar `Strict-Transport-Security` | `vercel.json`, `netlify.toml` | ☑️ |
| T1.2 | (Opcional) acotar `connect-src` al ref de Supabase | `vercel.json`, `netlify.toml` | ☑️ (hecho en SEC-008) |
| T1.3 | `envPrefix` → único prefijo `PUBLIC_` + rename de env | `vite.config.ts`, `src/**`, `.env.example`, docs | ☑️ |
| T1.4 | Actualizar docs (retirar Web3Forms) | `conductor/servicios.md` (+ tech-stack, README) | ☑️ |

## Fase V — Verificación

| # | Tarea | Herramienta | Estado |
|---|-------|-------------|--------|
| V.1 | `HEAD` a prod verifica HSTS y CSP | curl | ☐ (post-deploy; run-2 ya confirmó HSTS que sirve Vercel) |
| V.2 | `npm run test` (incl. `headersConfig.test.ts`) / `typecheck` / `lint` | npm | ☑️ (70 archivos / 468 tests) |
| V.3 | Commit `chore(security): higiene de config (HSTS, docs, envPrefix) (SEC-009)` + docs | git | ☑️ |

---

## Riesgos

| Riesgo | Mitigación |
|--------|-----------|
| Duplicar/contradecir HSTS que ya pone Vercel | Declarar el mismo valor (`max-age=63072000`); verificar con `HEAD` |
| Rename de env rompe prod si no se hace en los hosts | CHECKLIST-OWNER §2.1: renombrar en Vercel/Netlify + `.env.local` antes/junto al deploy |
| `connect-src` estricto rompe realtime | Si se agrega Realtime: incluir el `wss` exacto |
| `style-src 'unsafe-inline'` | Conservado a propósito (estilos inline de React); no hay `unsafe-inline` en `script-src` |

# Plan: Higiene de configuración de seguridad

> **Track ID:** `sec_config_hygiene_20261011`
> **Spec:** [./spec.md](./spec.md)
> **Status:** 🔜 Pendiente

---

## Fase 1 — Config

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T1.1 | Declarar `Strict-Transport-Security` | `vercel.json`, `netlify.toml` | ☐ |
| T1.2 | (Opcional) acotar `connect-src` al ref de Supabase | `vercel.json`, `netlify.toml` | ☐ |
| T1.3 | Revisar `envPrefix` y comentar por qué es público | `vite.config.ts` | ☐ |
| T1.4 | Actualizar docs (retirar Web3Forms) | `conductor/servicios.md` (+ otros) | ☐ |

## Fase V — Verificación

| # | Tarea | Herramienta | Estado |
|---|-------|-------------|--------|
| V.1 | `HEAD` a prod verifica HSTS y CSP | curl | ☐ |
| V.2 | `npm run test` (incl. `headersConfig.test.ts`) / `typecheck` / `lint` | npm | ☐ |
| V.3 | Commit `chore(security): higiene de config (HSTS, docs, envPrefix) (SEC-009)` + docs | git | ☐ |

---

## Riesgos

| Riesgo | Mitigación |
|--------|-----------|
| Duplicar/contradecir HSTS que ya pone Vercel | Declarar el mismo valor; verificar con `HEAD` |
| `connect-src` estricto rompe realtime | Incluir el dominio `wss` exacto |

# Plan: Endurecer almacenamiento de sesión

> **Track ID:** `sec_session_hardening_20261011`
> **Spec:** [./spec.md](./spec.md)
> **Status:** 🔜 Pendiente

---

## Fase 0 — Evaluación

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T0.1 | Evaluar viabilidad de cookies httpOnly con Supabase (SSR/middleware vs. SPA puro) | `src/lib/supabase.ts` | ☐ |
| T0.2 | Redactar ADR con la decisión y trade-offs | `conductor/` o `.scratch/` | ☐ |

## Fase 1 — Implementación (si aplica)

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T1.1 | (Opcional) migrar storage a cookies httpOnly | `src/lib/supabase.ts` | ☐ |
| T1.2 | Acotar `connect-src` al ref de Supabase en CSP | `vercel.json`, `netlify.toml` | ☐ |

## Fase V — Verificación

| # | Tarea | Herramienta | Estado |
|---|-------|-------------|--------|
| V.1 | `npm run test` / `typecheck` / `lint` + verificación de headers | npm/curl | ☐ |
| V.2 | Commit `feat(security): endurecer sesion/CSP (SEC-008)` + docs | git | ☐ |

---

## Riesgos

| Riesgo | Mitigación |
|--------|-----------|
| Cookies httpOnly + Supabase en SPA requiere cambios de arquitectura | Documentar y aceptar si el costo supera el beneficio; priorizar CSP |
| `connect-src` estricto rompe realtime (`wss`) | Incluir el dominio `wss` exacto del proyecto |

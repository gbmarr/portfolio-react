# Plan: Proteger `project_briefs.status`

> **Track ID:** `sec_brief_status_guard_20261011`
> **Spec:** [./spec.md](./spec.md)
> **Status:** 🔜 Pendiente

---

## Fase 1 — Diseño y migración

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T1.1 | Decidir enfoque: (a) extender guard para bloquear `status` a no-admin, o (b) derivar `status` en trigger server-side según `answers` | — | ☐ |
| T1.2 | Implementar en nueva migración `0011_*` | `supabase/migrations/0011_*` | ☐ |
| T1.3 | Si se deriva server-side, simplificar `updateBriefAnswers` (dejar de calcular `status` en cliente) | `src/lib/briefs.ts` | ☐ |

## Fase V — Verificación

| # | Tarea | Herramienta | Estado |
|---|-------|-------------|--------|
| V.1 | Test RLS/trigger: cliente no puede forzar status indebido | Vitest/Supabase | ☐ |
| V.2 | `npm run test` / `typecheck` / `lint` | npm | ☐ |
| V.3 | Commit `fix(security): proteger project_briefs.status (SEC-006)` + docs | git | ☐ |

---

## Riesgos

| Riesgo | Mitigación |
|--------|-----------|
| Derivar server-side rompe el UX de "guardado parcial" | Definir regla de completitud clara y cubrir con tests |

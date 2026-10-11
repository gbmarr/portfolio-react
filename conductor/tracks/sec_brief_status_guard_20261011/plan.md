# Plan: Proteger `project_briefs.status`

> **Track ID:** `sec_brief_status_guard_20261011`
> **Spec:** [./spec.md](./spec.md)
> **Status:** 🧪 En implementación — código listo (migración 0011 + cliente sin `status`); pendiente aplicar la migración.

---

## Fase 1 — Diseño y migración

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T1.1 | Decidir enfoque: **derivar `status` en trigger server-side** (alternativa b) | — | ☑️ |
| T1.2 | Migración `0011_brief_status_derive.sql`: `brief_answer_ok()`, `compute_brief_status()` + guard extendido | `supabase/migrations/0011_brief_status_derive.sql` | ☑️ |
| T1.3 | `updateBriefAnswers` deja de calcular/enviar `status` (solo `{ answers }`) | `src/lib/briefs.ts` | ☑️ |

## Fase V — Verificación

| # | Tarea | Herramienta | Estado |
|---|-------|-------------|--------|
| V.1 | Tests unitarios: el payload del cliente ya no incluye `status` (SEC-006) | Vitest (`src/lib/briefs.test.ts`) | ☑️ |
| V.2 | `npm run test` (70 archivos / 465 tests) / `typecheck` / `lint` | npm | ☑️ |
| V.3 | Commit `fix(security): proteger project_briefs.status (SEC-006)` + docs + CHECKLIST-OWNER | git | ☑️ |

---

## Riesgos

| Riesgo | Mitigación |
|--------|-----------|
| Derivar server-side rompe el UX de "guardado parcial" | La regla de completitud se mantiene (espejo del frontend) y se cubre con tests; el cliente conserva el preview de estado local. |
| Desincronización entre templates TS y `compute_brief_status` SQL | Documentado en el encabezado de la migración y en el CHECKLIST-OWNER (actualizar ambos en conjunto si cambian los templates). |
| Migración aplicada sin el código (o viceversa) | Orden documentado en CHECKLIST-OWNER §1. |

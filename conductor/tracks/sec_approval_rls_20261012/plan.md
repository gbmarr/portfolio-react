# Plan: Ownership en el UPDATE de `milestone_approvals`

> **Track ID:** `sec_approval_rls_20261012`
> **Spec:** [./spec.md](./spec.md)
> **Status:** 🟡 Implementado (código listo); pendiente aplicar la migración `0016` en Supabase (owner).

---

## Fase 1 — Migración

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T1.1 | Recrear policy de UPDATE con ownership en `using`/`with check` | `supabase/migrations/0016_approval_update_ownership.sql` | ☑️ |
| T1.2 | `CHECKLIST-OWNER.md` (aplicar/verificar) | track | ☑️ |

## Fase V — Verificación

| # | Tarea | Herramienta | Estado |
|---|-------|-------------|--------|
| V.1 | Test guard: la migración re-crea la policy con el `exists(...)` de ownership | Vitest | ☑️ (`src/approvalUpdateOwnership.test.ts`, 4 tests) |
| V.2 | `npm run test` / `typecheck` / `lint` | npm | ☑️ (77 archivos / 516 tests; typecheck ok; lint ok) |
| V.3 | Verificación manual: update con `project_id` ajeno rechazado | owner | ☐ — ver `CHECKLIST-OWNER.md` |
| V.4 | Commit `fix(security): ownership en UPDATE de milestone_approvals (RT-03)` | git | ☑️ (`6d21fc1`) |

---

## Riesgos

| Riesgo | Mitigación |
|--------|-----------|
| Recrear la policy con nombre distinto | Usar `drop policy if exists` con el nombre exacto actual |
| Romper el flujo legítimo de aprobación | Cubrir con test + verificación manual |

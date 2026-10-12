# Plan: Ownership en el UPDATE de `milestone_approvals`

> **Track ID:** `sec_approval_rls_20261012`
> **Spec:** [./spec.md](./spec.md)
> **Status:** 🚧 Pendiente.

---

## Fase 1 — Migración

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T1.1 | Recrear policy de UPDATE con ownership en `using`/`with check` | `supabase/migrations/0015_approval_update_ownership.sql` | ☐ |
| T1.2 | `CHECKLIST-OWNER.md` (aplicar/verificar) | track | ☐ |

## Fase V — Verificación

| # | Tarea | Herramienta | Estado |
|---|-------|-------------|--------|
| V.1 | Test guard: la migración re-crea la policy con el `exists(...)` de ownership | Vitest | ☐ |
| V.2 | `npm run test` / `typecheck` / `lint` | npm | ☐ |
| V.3 | Verificación manual: update con `project_id` ajeno rechazado | owner | ☐ |
| V.4 | Commit `fix(security): ownership en UPDATE de milestone_approvals (RT-03)` | git | ☐ |

---

## Riesgos

| Riesgo | Mitigación |
|--------|-----------|
| Recrear la policy con nombre distinto | Usar `drop policy if exists` con el nombre exacto actual |
| Romper el flujo legítimo de aprobación | Cubrir con test + verificación manual |

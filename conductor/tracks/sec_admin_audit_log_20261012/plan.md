# Plan: Audit log de acciones admin

> **Track ID:** `sec_admin_audit_log_20261012`
> **Spec:** [./spec.md](./spec.md)
> **Status:** ✅ Implementado (código listo 2026-10-12); pasos de owner pendientes (aplicar `0014` + verificación manual).
> **Reglas:** `metadata` acotado (sin PII innecesaria); no fugar secretos al log.

---

## Fase 1 — Migración

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T1.1 | Tabla `audit_log` + índices + RLS | `supabase/migrations/0014_audit_log.sql` | ☑️ |
| T1.2 | Función `audit_row()` genérica + triggers por tabla | idem | ☑️ |
| T1.3 | Consultas de detección (documentadas) | `CHECKLIST-OWNER.md` | ☑️ |

## Fase V — Verificación

| # | Tarea | Herramienta | Estado |
|---|-------|-------------|--------|
| V.1 | Test guard: la migración define la tabla y los triggers; RLS solo-admin | Vitest | ☑️ `src/auditLog.test.ts` (6 tests) |
| V.2 | `npm run test` / `typecheck` / `lint` | npm | ☑️ 73 archivos / 499 tests; typecheck ok; lint limpio |
| V.3 | Verificación manual: acción de prueba registrada en staging | owner | ☐ (paso de owner, `CHECKLIST-OWNER.md` §2) |
| V.4 | Commit `feat(security): audit log de acciones admin (RT-04)` | git | ☐ |

---

## Riesgos

| Riesgo | Mitigación |
|--------|-----------|
| Sobrecarga de escritura | Triggers livianos + índices; `metadata` mínimo |
| Fuga de datos sensibles al log | Registrar ids y campos descriptivos, no filas completas |
| Volumen/crecimiento | Documentar retención y limpieza programada |

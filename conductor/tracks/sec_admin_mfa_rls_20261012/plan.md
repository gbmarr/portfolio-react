# Plan: MFA admin aplicada en RLS (AAL2 server-side)

> **Track ID:** `sec_admin_mfa_rls_20261012`
> **Spec:** [./spec.md](./spec.md)
> **Status:** 🚧 En implementación.
> **Reglas:** choke point único; fallar cerrado; migración aplicada en conjunto con el deploy.

---

## Fase 0 — Diseño

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T0.1 | Enumerar todos los usos de `is_admin()` (policies + triggers) y confirmar el choke point | `supabase/migrations/*.sql` | ☑️ |
| T0.2 | Decidir enfoque: redefinir `is_admin()` delegando en `is_admin_aal2()` (evita reescribir ~20 policies) | — | ☑️ |

## Fase 1 — Migración

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T1.1 | `is_admin_aal2()` + `is_admin()` delegado | `supabase/migrations/0013_admin_aal2.sql` | ☑️ |
| T1.2 | `CHECKLIST-OWNER.md` (aplicar/verificar/recuperar) | `conductor/tracks/sec_admin_mfa_rls_20261012/CHECKLIST-OWNER.md` | ☑️ |

## Fase V — Verificación

| # | Tarea | Herramienta | Estado |
|---|-------|-------------|--------|
| V.1 | Test guard: la migración define `is_admin_aal2()` y `is_admin()` delega (AAL2) | Vitest (`src/rlsAdmin.test.ts`) | ☑️ |
| V.2 | `npm run test` (72 archivos / 493 tests) / `typecheck` / `lint` | npm | ☑️ |
| V.3 | Verificación manual AAL1→403 / AAL2→OK (staging) | owner | ☐ |
| V.4 | Commit `fix(security): exigir AAL2 para admin en RLS (RT-01)` + docs | git | ☐ |

---

## Riesgos

| Riesgo | Mitigación |
|--------|-----------|
| Admin bloqueado en AAL1 (pierde el dispositivo TOTP) | Códigos de recuperación (SEC-002) + procedimiento documentado en CHECKLIST-OWNER |
| Migración aplicada sin el código (o viceversa) | Orden documentado; el código ya exige AAL2 en la UI, la migración lo hace efectivo en la base |
| Dependencia del claim `aal` | Confirmado que Supabase lo incluye en el access token; verificar en la prueba manual |

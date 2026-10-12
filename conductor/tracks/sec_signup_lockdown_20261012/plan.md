# Plan: Cerrar el self-signup por API y validar `client_email`

> **Track ID:** `sec_signup_lockdown_20261012`
> **Spec:** [./spec.md](./spec.md)
> **Status:** ✅ Implementado (código listo 2026-10-12); pasos de owner pendientes (`disable_signup` + aplicar `0015`).
> **Reglas:** no romper el flujo de invitación; fallar cerrado.

---

## Fase 0 — Confirmación del modelo (owner)

| # | Tarea | Herramienta | Estado |
|---|-------|-------------|--------|
| T0.1 | Confirmar si el modelo es *invite-only* (¿debe poder auto-registrarse alguien?) | owner | ☑️ modelo invite-only confirmado por diseño (login `shouldCreateUser:false`; invitación explícita) |
| T0.2 | Verificar el estado actual de `disable_signup` en Supabase Auth | dashboard | ☐ (paso de owner, `CHECKLIST-OWNER.md` §1) |

## Fase 1 — Config y validación

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T1.1 | Activar `disable_signup` (si aplica) | dashboard (CHECKLIST-OWNER) | ☐ (paso de owner) |
| T1.2 | Validar/normalizar `client_email` en alta/edición de proyecto | `src/utils/email.ts` + `src/lib/projects.ts` + UI admin | ☑️ |
| T1.3 | Defensa en profundidad: CHECK estructural en la base | `supabase/migrations/0015_client_email_valid.sql` | ☑️ |

## Fase V — Verificación

| # | Tarea | Herramienta | Estado |
|---|-------|-------------|--------|
| V.1 | Test: rechazo de `client_email` inválido + normalización a minúsculas | Vitest | ☑️ `email.test.ts` (7), `projects.test.ts` (5), form (1) — `clientEmailValid.test.ts` (4) |
| V.2 | `npm run test` / `typecheck` / `lint` | npm | ☑️ 76 archivos / 512 tests; typecheck ok; lint limpio |
| V.3 | Verificación manual: `otp?create_user=true` rechazado; invitación funciona | owner | ☐ (paso de owner, `CHECKLIST-OWNER.md` §1–2) |
| V.4 | Commit `fix(security): cerrar self-signup por API + validar client_email (RT-02)` | git | ☐ |

---

## Riesgos

| Riesgo | Mitigación |
|--------|-----------|
| `disable_signup` rompe la invitación del admin | La invitación usa el endpoint de invite/admin; verificar en staging antes de prod |
| Validación demasiado estricta rechaza emails válidos | Usar un validador de email razonable; probar casos límite |

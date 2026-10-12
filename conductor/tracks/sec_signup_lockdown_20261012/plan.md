# Plan: Cerrar el self-signup por API y validar `client_email`

> **Track ID:** `sec_signup_lockdown_20261012`
> **Spec:** [./spec.md](./spec.md)
> **Status:** 🚧 Pendiente.
> **Reglas:** no romper el flujo de invitación; fallar cerrado.

---

## Fase 0 — Confirmación del modelo (owner)

| # | Tarea | Herramienta | Estado |
|---|-------|-------------|--------|
| T0.1 | Confirmar si el modelo es *invite-only* (¿debe poder auto-registrarse alguien?) | owner | ☐ |
| T0.2 | Verificar el estado actual de `disable_signup` en Supabase Auth | dashboard | ☐ |

## Fase 1 — Config y validación

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T1.1 | Activar `disable_signup` (si aplica) | dashboard (CHECKLIST-OWNER) | ☐ |
| T1.2 | Validar/normalizar `client_email` en alta/edición de proyecto | `src/lib/projects.ts` (+ UI admin) | ☐ |

## Fase V — Verificación

| # | Tarea | Herramienta | Estado |
|---|-------|-------------|--------|
| V.1 | Test: rechazo de `client_email` inválido + normalización a minúsculas | Vitest | ☐ |
| V.2 | `npm run test` / `typecheck` / `lint` | npm | ☐ |
| V.3 | Verificación manual: `otp?create_user=true` rechazado; invitación funciona | owner | ☐ |
| V.4 | Commit `fix(security): cerrar self-signup por API + validar client_email (RT-02)` | git | ☐ |

---

## Riesgos

| Riesgo | Mitigación |
|--------|-----------|
| `disable_signup` rompe la invitación del admin | La invitación usa el endpoint de invite/admin; verificar en staging antes de prod |
| Validación demasiado estricta rechaza emails válidos | Usar un validador de email razonable; probar casos límite |

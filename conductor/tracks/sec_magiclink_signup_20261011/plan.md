# Plan: Restringir el registro por magic link

> **Track ID:** `sec_magiclink_signup_20261011`
> **Spec:** [./spec.md](./spec.md)
> **Status:** 🚧 En implementación (código listo y verificado; falta commit)

---

## Fase 1 — Cambio

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T1.1 | Aplicar `shouldCreateUser: false` en el login y exponer `inviteByMagicLink` (crea cuenta) para el admin | `src/lib/auth.tsx`, `src/lib/auth-context.ts` | ☑️ |
| T1.2 | `user_not_found` sin revelar existencia (misma confirmación de éxito) | `src/pages/LoginPage.tsx` | ☑️ |
| T1.3 | Migrar invitaciones del admin a `inviteByMagicLink` | `ProjectDetailPage.tsx`, `ClientsPage.tsx` | ☑️ |

## Fase V — Verificación

| # | Tarea | Herramienta | Estado |
|---|-------|-------------|--------|
| V.1 | Tests: `user_not_found` en login; `shouldCreateUser:false`/`true` en auth layer; invitación admin | Vitest | ☑️ |
| V.2 | `npm run test` (463 ✓) / `typecheck` / `lint` | npm | ☑️ |
| V.3 | Commit `fix(security): restringir auto-registro por magic link (SEC-005)` + docs | git | ☑️ (`5b4bbdc`) |

---

## Riesgos

| Riesgo | Mitigación |
|--------|-----------|
| Romper la primera invitación de un cliente que aún no tiene cuenta | RESUELTO: las invitaciones del admin usan `inviteByMagicLink` con `shouldCreateUser: true` (crea la cuenta), mientras el login público no crea (`shouldCreateUser: false`). |

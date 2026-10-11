# Plan: Restringir el registro por magic link

> **Track ID:** `sec_magiclink_signup_20261011`
> **Spec:** [./spec.md](./spec.md)
> **Status:** 🔜 Pendiente

---

## Fase 1 — Cambio

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T1.1 | Aplicar `shouldCreateUser: false` (o allowlist) en `signInWithMagicLink` | `src/lib/auth.tsx` | ☐ |
| T1.2 | Ajustar mensaje/UX del resultado | `src/pages/LoginPage.tsx` | ☐ |
| T1.3 | Verificar que la invitación del admin sigue creando/accediendo correctamente | `ProjectDetailPage.tsx`, `ClientsPage.tsx` | ☐ |

## Fase V — Verificación

| # | Tarea | Herramienta | Estado |
|---|-------|-------------|--------|
| V.1 | Test: email no invitado no crea usuario | Vitest/manual | ☐ |
| V.2 | `npm run test` / `typecheck` / `lint` | npm | ☐ |
| V.3 | Commit `fix(security): restringir auto-registro por magic link (SEC-005)` + docs | git | ☐ |

---

## Riesgos

| Riesgo | Mitigación |
|--------|-----------|
| Romper la primera invitación de un cliente que aun no tiene cuenta | Confirmar que el admin usa `inviteUserByEmail` o que el email se pre-crea; ajustar el flujo de invitacion si hace falta |

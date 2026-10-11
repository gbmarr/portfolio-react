# Plan: MFA / step-up para el acceso admin

> **Track ID:** `sec_admin_mfa_20261011`
> **Spec:** [./spec.md](./spec.md)
> **Status:** 🔜 Pendiente
> **Reglas:** acciones de dashboard documentadas para el owner; fallar cerrado.

---

## Fase 0 — Doc y diseño

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T0.1 | Verificar API de MFA/AAL de Supabase (Context7: `supabase-js`/gotrue) | — | ☐ |
| T0.2 | Diseñar el flujo de step-up (enrolar TOTP, verificar, recuperar) | — | ☐ |
| T0.3 | Crear `CHECKLIST-OWNER.md` con pasos de dashboard | `CHECKLIST-OWNER.md` | ☐ |

## Fase 1 — Auth y guards

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T1.1 | Añadir `mfa.enroll/verify/challenge` y helpers en el layer de auth | `src/lib/auth.tsx` (o `auth-context.ts`) | ☐ |
| T1.2 | Guard `RequiereAdmin`: exigir AAL2 (usar `getAuthenticatorAssuranceLevel`) | `src/routes/guards.tsx` | ☐ |
| T1.3 | Página/flujo de enrolamiento y verificación MFA | `src/pages/AdminMfaPage.tsx` (nuevo) | ☐ |

## Fase 2 — Config del proveedor (owner)

| # | Tarea | Herramienta | Estado |
|---|-------|-------------|--------|
| T2.1 | Habilitar TOTP MFA en Supabase Auth | dashboard | ☐ |
| T2.2 | Activar Leaked Password Protection | dashboard | ☐ |
| T2.3 | Endurecer rate-limit/contraseñas de GoTrue | dashboard | ☐ |

## Fase V — Verificación

| # | Tarea | Herramienta | Estado |
|---|-------|-------------|--------|
| V.1 | Tests del guard (AAL1 bloquea, AAL2 permite) | Vitest | ☐ |
| V.2 | `npm run test` / `typecheck` / `lint` | npm | ☐ |
| V.3 | Commit `feat(security): exigir MFA (AAL2) para admin (SEC-002)` + docs | git | ☐ |

---

## Riesgos

| Riesgo | Mitigación |
|--------|-----------|
| Lockout del admin si pierde el dispositivo | Generar y guardar códigos de recuperación; documentar en checklist |
| MFA solo en cliente (bypasseable) | La autorización real sigue en RLS; AAL2 es defensa de sesión. Evaluar `restrict`/claim en RLS si Supabase lo soporta |

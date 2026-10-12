# Spec — MFA admin aplicada en RLS (AAL2 server-side)

> **Track ID:** `sec_admin_mfa_rls_20261012`
> **Fuente:** Hallazgo **RT-01 (Alta)** del red team 2026-10-12 (`conductor/security/red-team-20261012/informe-cadena-ataque.md`).
> **Estado:** 🚧 En implementación.

---

## 1. Contexto y objetivo

La MFA del admin (SEC-002) se aplica **solo en el cliente**: `src/routes/guards.tsx:27-40` exige `aal==='aal2'`, pero la autorización real vive en RLS y **no mira el claim `aal`**. `public.is_admin()` (`supabase/migrations/0001_init.sql:54-65`) sólo comprueba `profiles.role='admin'`.

Consecuencia: un atacante con la contraseña del admin autentica por API (`/auth/v1/token?grant_type=password`), obtiene un token **AAL1** y accede a **toda** la información de clientes vía PostgREST, sin TOTP y sin pasar por la UI. La MFA no protege el escenario que motiva su existencia.

**Objetivo:** que la autorización de admin dependa de una sesión **AAL2** (rol admin **y** `auth.jwt()->>'aal'='aal2'`), corrigiendo el desajuste en un único choke point.

## 2. Functional Requirements

- **FR1 —** Nuevo helper `public.is_admin_aal2()` = `role='admin'` **y** `(auth.jwt()->>'aal')='aal2'`.
- **FR2 —** `public.is_admin()` pasa a delegar en `is_admin_aal2()` (choke point único): toda policy/trigger que hoy use `is_admin()` queda endurecida sin reescribir cada policy.
- **FR3 —** No romper el arranque del SPA: el admin debe seguir leyendo **su propio** perfil en AAL1 (para conocer su rol y ser redirigido a `/admin/mfa`). La self-read (`auth.uid()=id`) no depende del helper.
- **FR4 —** No afectar al `service_role` (Edge Functions): bypassa RLS por diseño.

## 3. Non-Functional Requirements

- **NFR1 —** Fallar cerrado: sin AAL2 no hay datos de admin.
- **NFR2 —** Suite de tests verde; cobertura no baja (umbral 80%).
- **NFR3 —** Documentar el procedimiento de recuperación (admin bloqueado en AAL1) en `CHECKLIST-OWNER.md`.
- **NFR4 —** La migración se aplica **junto** con el deploy del código (documentar el acoplamiento).

## 4. Acceptance Criteria

- [ ] Token **AAL1** de un admin → `select` a `projects`/`profiles`/`contact_messages` devuelve **0 filas / 403**.
- [ ] Tras verificar TOTP (AAL2) → el mismo `select` devuelve las filas.
- [ ] El admin en AAL1 sigue pudiendo leer su propio perfil (rol) para el step-up.
- [x] `npm run test` / `typecheck` / `lint` verdes. *(72 archivos / 493 tests)*
- [x] `CHECKLIST-OWNER.md` con aplicación + verificación + recuperación.

## 5. Out of Scope

- Enrolamiento TOTP de clientes (solo admin).
- `audit_log` (ver track `sec_admin_audit_log_20261012`, RT-04).
- Cambios de UI del flujo MFA (ya cubierto por SEC-002).

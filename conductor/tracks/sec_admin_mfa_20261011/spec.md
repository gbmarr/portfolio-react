# Spec — MFA / step-up para el acceso admin

> **Track ID:** `sec_admin_mfa_20261011`
> **Fuente:** Hallazgo **SEC-002 (Media)** de la auditoría de seguridad run-2.
> **Estado:** 🚧 En implementación (código listo y verificado; pendiente config dashboard del owner).

---

## 1. Contexto y objetivo

`/acceso-admin` autentica con email + contraseña (`signInWithPassword` en `src/lib/auth.tsx:93-97`) y **sin segundo factor**. Las passkeys fueron desactivadas. Un atacante con la contraseña (phishing, reuso, filtración) obtiene control total del panel admin (proyectos, clientes, mensajes). Para un objetivo **ASVS L2–L3**, se requiere MFA y step-up de autenticación en acciones sensibles.

**Objetivo:** exigir **AAL2** (segundo factor) para entrar al panel admin, más defensas complementarias (protección de contraseñas filtradas, rate-limit de autenticación).

## 2. Functional Requirements

- **FR1 —** El rol `admin` debe requerir MFA (TOTP/AAL2) para acceder a `/admin/*`. Si la sesión es AAL1, forzar enrolamiento/verificación de MFA antes de continuar (step-up).
- **FR2 —** Aplicar la verificación AAL2 en el guard de rutas (`RequiereAdmin`) y en cualquier acción sensible si se decide granularidad mayor.
- **FR3 —** Habilitar **Leaked Password Protection** (HaveIBeenPwned) en Supabase Auth.
- **FR4 —** Ajustar límites de intentos de autenticación de GoTrue (rate-limit de sign-in) y política de contraseñas.

## 3. Non-Functional Requirements

- **NFR1 —** El usuario admin debe tener una UX clara de enrolamiento (QR TOTP) y recuperación de códigos.
- **NFR2 —** Sin MFA no se accede a datos admin (fallar cerrado).
- **NFR3 —** Suite de tests verde; cobertura no baja.
- **NFR4 —** Documentar los pasos de dashboard (owner) en un `CHECKLIST-OWNER.md` del track.

## 4. Acceptance Criteria

- [x] Admin con sesión AAL1 es redirigido a enrolar/verificar MFA. *(implementado + test)*
- [x] Admin con AAL2 accede normalmente a `/admin/*`. *(implementado + test)*
- [x] `npm run test` / `typecheck` / `lint` verdes. *(69 archivos / 459 tests)*
- [ ] Leaked Password Protection activada (verificable en dashboard/API). *(pendiente owner)*
- [ ] Rate-limit de auth configurado; documentado. *(pendiente owner — ver `CHECKLIST-OWNER.md`)*

## 5. Out of Scope

- MFA para clientes (solo admin).
- SSO/OAuth de terceros.
- Rotación de contraseñas automática.

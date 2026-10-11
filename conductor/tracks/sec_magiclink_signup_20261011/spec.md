# Spec — Restringir el registro por magic link

> **Track ID:** `sec_magiclink_signup_20261011`
> **Fuente:** Hallazgo **SEC-005 (Baja)** de la auditoría de seguridad run-2.
> **Estado:** 🔜 Pendiente.

---

## 1. Contexto y objetivo

`signInWithMagicLink` (`src/lib/auth.tsx:80-91`) llama a `signInWithOtp({ email, options: { emailRedirectTo } })` **sin `shouldCreateUser`**, cuyo default es `true`: cualquier email genera usuario y perfil (vía trigger `handle_new_user`). El modelo previsto es que el cliente solo accede **por invitación** del admin (magic link a un `client_email` ya existente).

**Objetivo:** impedir el auto-registro, sin romper el flujo de invitación de clientes.

## 2. Functional Requirements

- **FR1 —** El login no debe crear usuarios para emails no invitados (usar `shouldCreateUser: false` o una allowlist/verificación equivalente).
- **FR2 —** El flujo de invitación del admin (ProjectDetail/Clients → magic link a `client_email`) debe seguir funcionando end-to-end.
- **FR3 —** Mensaje de UX coherente cuando el email no está autorizado (sin filtrar si existe o no la cuenta, si es posible).

## 3. Non-Functional Requirements

- **NFR1 —** Sin regresión en el acceso de clientes existentes.
- **NFR2 —** Suite verde.

## 4. Acceptance Criteria

- [ ] Email no invitado no crea usuario/perfil al pedir magic link.
- [ ] Cliente invitado entra normalmente.
- [ ] `npm run test` / `typecheck` / `lint` verdes.

## 5. Out of Scope

- MFA admin (otro track).
- Cambiar el proveedor de email.

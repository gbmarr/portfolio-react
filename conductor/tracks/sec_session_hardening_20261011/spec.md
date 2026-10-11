# Spec — Endurecer almacenamiento de sesión

> **Track ID:** `sec_session_hardening_20261011`
> **Fuente:** Hallazgo **SEC-008 (Baja)** de la auditoría de seguridad run-2.
> **Estado:** 🔜 Pendiente.

---

## 1. Contexto y objetivo

La sesión de Supabase se guarda en `localStorage` (`src/lib/supabase.ts:16-21`, `storageKey: 'portfolio-auth'`), accesible a JavaScript. Ante un XSS, el atacante podría exfiltrar el token de refresco. Hoy **no hay sinks XSS conocidos** (React escapa por defecto; sin `dangerouslySetInnerHTML`), por lo que es un riesgo **bajo**, pero es defensa en profundidad relevante para ASVS L3.

**Objetivo:** reducir la exposición de tokens y acotar la superficie de exfiltración.

## 2. Functional Requirements

- **FR1 —** Evaluar mover la sesión a cookies `httpOnly`/`Secure`/`SameSite` (o documentar por qué no es viable en el modelo SPA + Supabase actual).
- **FR2 —** Endurecer CSP (`connect-src` al proyecto exacto) para limitar exfiltración.
- **FR3 —** Documentar la decisión (ADR corto) con trade-offs.

## 3. Non-Functional Requirements

- **NFR1 —** No romper el flujo de auth actual (magic link, refresh, multi-pestaña).
- **NFR2 —** Suite verde.

## 4. Acceptance Criteria

- [ ] Decisión documentada (implementar cookies o aceptar con justificación).
- [ ] Si aplica `connect-src` acotado al ref de Supabase.
- [ ] `npm run test` / `typecheck` / `lint` verdes.

## 5. Out of Scope

- Rediseñar el flujo de autenticación de clientes.
- MFA (otro track).

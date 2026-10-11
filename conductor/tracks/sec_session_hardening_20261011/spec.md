# Spec — Endurecer almacenamiento de sesión

> **Track ID:** `sec_session_hardening_20261011`
> **Fuente:** Hallazgo **SEC-008 (Baja)** de la auditoría de seguridad run-2.
> **Estado:** 🧪 En implementación (código listo; pendiente deploy/verificación en prod).

---

## 1. Contexto y objetivo

La sesión de Supabase se guarda en `localStorage` (`src/lib/supabase.ts:16-21`, `storageKey: 'portfolio-auth'`), accesible a JavaScript. Ante un XSS, el atacante podría exfiltrar el token de refresco. Hoy **no hay sinks XSS conocidos** (React escapa por defecto; sin `dangerouslySetInnerHTML`), por lo que es un riesgo **bajo**, pero es defensa en profundidad relevante para ASVS L3.

**Objetivo:** reducir la exposición de tokens y acotar la superficie de exfiltración.

## 2. Functional Requirements

- **FR1 —** Evaluar mover la sesión a cookies `httpOnly`/`Secure`/`SameSite` (o documentar por qué no es viable en el modelo SPA + Supabase actual). **Decisión (ADR-0001):** inviable en SPA estática sin SSR; se conserva `localStorage` y se mitigó con **PKCE** (`flowType: 'pkce'`) para sacar los tokens de la URL del redirect.
- **FR2 —** Endurecer CSP (`connect-src` al proyecto exacto) para limitar exfiltración. **Aplicado:** `https://jntueibgkfwptigpncmh.supabase.co` + `.functions.supabase.co`, sin comodín ni `wss` (la app no usa Realtime).
- **FR3 —** Documentar la decisión (ADR corto) con trade-offs. **Hecho:** `conductor/decisions/0001-sesion-spa-sin-cookies-httponly.md`.

## 3. Non-Functional Requirements

- **NFR1 —** No romper el flujo de auth actual (magic link, refresh, multi-pestaña). **Verificado:** suite completa verde (467 tests).
- **NFR2 —** Suite verde. **Cumplido.**

## 4. Acceptance Criteria

- [x] Decisión documentada (implementar cookies o aceptar con justificación). → ADR-0001.
- [x] Si aplica `connect-src` acotado al ref de Supabase. → vercel.json, netlify.toml + test `src/headersConfig.test.ts`.
- [x] `npm run test` / `typecheck` / `lint` verdes. → 70 archivos / 467 tests.

## 5. Out of Scope

- Rediseñar el flujo de autenticación de clientes.
- MFA (otro track).

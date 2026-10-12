# Spec — Hardening del envío de email del formulario de contacto

> **Track ID:** `sec_contact_email_hardening_20261011`
> **Fuente:** Solicitud del owner (2026-10-11): *"aumentar el nivel de seguridad de los envíos de emails en el formulario de contacto"* + análisis de viabilidad del **allowlist de proveedores** (ADR-0002: rechazado).
> **Estado:** 🧪 En implementación (código listo; pendiente aplicar migración `0012` y deploy de la Edge Function por el owner).

---

## 1. Contexto y objetivo

El owner propuso restringir los proveedores de email permitidos (ej. gmail). El análisis concluyó (ADR-0002) que el allowlist no aporta seguridad real (evadible, no autentica, rompe el modo "email o WhatsApp", falsos positivos) y se reemplaza por hardening real del envío:

1. **SEC-005 (Media, CWE-93/CWE-20, OWASP A03:2021):** `name`/`email` van al `subject` y `reply_to` del email (Resend). La validación server-side (`validate()` en `index.ts`) solo chequeaba longitud → un **POST directo** a la Edge Function (sin pasar por el navegador) podía inyectar headers de email (CRLF).
2. **SEC-006 (Baja, CWE-345):** `siteverify` de Turnstile solo miraba `success`; no validaba `action` ni `hostname` → tokens reutilizables de otros widgets/contextos no se distinguían.
3. **SEC-007 (Info):** sin filtro contra dominios desechables (ruido en la bandeja).

**Objetivo:** cerrar la vía de inyección de headers de email en profundidad (Edge Function + esquema), ligar el token de Turnstile al widget/hostname correctos, y reducir ruido con una blocklist de dominios desechables sin romper la UX "email o WhatsApp".

## 2. Functional Requirements

- **FR1 (SEC-005)** — La Edge Function rechaza caracteres de control (CR/LF/NUL, `0x00–0x1F`, `0x7F`) en `name` y en `email` con `400 invalid-payload`. `message` SÍ admite saltos de línea.
- **FR2 (SEC-005)** — `reply_to` solo se envía a Resend cuando el valor es un email válido (`isSafeEmail`); si es WhatsApp/teléfono se omite. El asunto sigue incluyendo el valor tal cual (tras rechazo de control chars).
- **FR3 (SEC-005)** — Paridad cliente: `hasControlChars(data.name)` en `ContactForm.tsx` y `hasControlChars(name|email)` en `validateContactPayload` (defensa UX; el navegador ya sanitiza CRLF de un `<input type="text">`).
- **FR4 (SEC-006)** — El widget Turnstile envía `action: 'contact'`; `verifyTurnstile` exige `success === true`, `action === 'contact'` y `hostname` en `{gabrielmarrero.com.ar, www.gabrielmarrero.com.ar, localhost}` (si Cloudflare lo informa).
- **FR5 (SEC-007)** — Blocklist de dominios desechables integrada en `validateContactInput` (razón `email`). Solo aplica a valores con `@`; un teléfono/WhatsApp nunca se bloquea.
- **FR6 (SEC-005, capa esquema)** — Migración `0012`: CHECK constraints `name !~ '[[:cntrl:]]'` y `email !~ '[[:cntrl:]]'` en `contact_messages`, idempotente (drop+add). `message` sin restricción (acepta saltos de línea).

## 3. Non-Functional Requirements

- **NFR1 —** Módulos puros y testeados con Vitest (sin imports Deno), mismo patrón que `email-result.ts` (SEC-004).
- **NFR2 —** Migración idempotente; orden de despliegue documentado (DB antes/después del deploy según CHECKLIST).
- **NFR3 —** No romper el flujo "email o WhatsApp": ningún dominio obligatorio, blocklist solo para `@`.
- **NFR4 —** Suite verde + typecheck + lint.

## 4. Acceptance Criteria

- [x] CRLF en `name` o `email` rechazado server-side (test `validation.test.ts`).
- [x] `reply_to` condicional a email válido (`isSafeEmail`).
- [x] Paridad cliente (tests `contactPayload.test.ts` y `ContactForm.test.tsx`).
- [x] Widget Turnstile con `action: 'contact'`; `isTurnstileResponseValid` exige action+hostname (tests).
- [x] Blocklist desechables + teléfono no bloqueado (tests).
- [x] Migración `0012` escrita, idempotente, con CHECK sobre `name`/`email` únicamente.
- [x] `npm run test` / `typecheck` / `lint` verdes.
- [ ] (Owner) Migración `0012` aplicada en Supabase + Edge Function desplegada.

## 5. Out of Scope

- Allowlist/restricción por proveedor (rechazado — ADR-0002).
- Separar los campos "email" y "WhatsApp" (decisión de producto revertida).
- Cambiar proveedor de email o Turnstile.
- Endurecimiento de otros flujos (briefs, almacenamiento, etc.).
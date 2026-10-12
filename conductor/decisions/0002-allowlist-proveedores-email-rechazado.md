# ADR-0002 — Restringir los proveedores de email en el formulario de contacto: rechazado

> **Estado:** Aceptado (decisión de no-implementar)
> **Fecha:** 2026-10-12
> **Track:** `sec_contact_email_hardening_20261011` (SEC-005 Media, SEC-006 Baja, SEC-007 Info)
> **Decisión:** **NO** aplicar un allowlist de proveedores de email (gmail, etc.) en el formulario de contacto; en su lugar, endurecer el envío con validación server-side anti-CRLF, verificación de acción/hostname de Turnstile y una blocklist opcional de dominios desechables.

---

## Contexto

- El usuario propuso: *"aplicar una restricción para que solo se puedan ingresar emails de ciertos proveedores, por ejemplo gmail, ¿es viable y ayuda a aumentar la seguridad?"*
- El campo de contacto es `type="text"` a propósito (`ContactForm.tsx`): acepta **o un email o un WhatsApp/teléfono** (decisión de producto confirmada por el dueño).
- Metas de la restricción: reducir spam/bots, emails falsos, inyección de headers/contenido malicioso, abuso/costo de la API de envío (Resend).

## Decisión

1. **Rechazado — allowlist de proveedores** (`@gmail.com`, `@outlook.com`, …):
   - **No autentica nada**: el atacante promedio usa Gmail igual. Bloquear dominios no verifica persona ni respondeabilidad real.
   - **Evadible** (dominios propios, catch-all, subdominios); no es un control de seguridad, es *security theater*.
   - **Rompe el modo "email o WhatsApp"** y genera **falsos positivos** con dominios corporativos/ISP (`@empresa.com.ar`) y clientes con cuentas de dominio propio.
2. **Se implementa el hardening real** (no el filtro cosmético):
   - **SEC-005 (CRLF/header injection en el email):** validación **server-side** en la Edge Function que rechaza caracteres de control en `name`/`email` (única defensa válida ante un POST directo, que no pasa por el navegador); `reply_to` solo cuando el valor es un email válido; paridad en validación cliente; CHECK constraints a nivel de esquema (migración `0012`).
   - **SEC-006 (Turnstile):** verificar además de `success` la **acción** y el **hostname** del token.
   - **SEC-007 (anti-ruido):** blocklist **opt-in** de dominios desechables (`mailinator`, `10minutemail`, `yopmail`, …). Es una mitigación de ruido, no un control de autoridad, y **nunca** afecta teléfonos/WhatsApp.
   - La protección real contra abuso/costo sigue siendo **Turnstile + throttle en PostgreSQL + límite global** (tracks SEC-003).
3. El combate al spam de bajo costo sin romper UX legítima se delega a los controles anti-bot existentes; el refuerzo aquí es de integridad del envío, no de admisión de remitentes.

## Consecuencias

- **Positivas:** se cierra la vía de **inyección de headers** por POST directo a la Edge Function (antes solo se validaba longitud); `reply_to` nunca recibe valores maliciosos; el token de Turnstile queda ligado al widget y hostname correctos; se reduce el ruido de correos basura desechables sin bloquear a nadie legítimo.
- **Negativas / trade-offs:** un mensaje con email desechable queda bloqueado (aceptado: es el objetivo del filtro); el allowlist pedido no se implementa (comunicado al usuario con la justificación); la blocklist es evadible por definición (dominio desechable nuevo) — se documenta como mitigación de ruido, no como control de seguridad.
- **Coste de mantenimiento:** la blocklist es un Set acotado y comentado en `validation.ts`; ampliarla es un cambio de una línea.

## Verificación

- Tests Vitest: `supabase/functions/contact-notify/validation.test.ts` (CRLF en name/email, blocklist, `isTurnstileResponseValid`, teléfono no bloqueado), paridad en `src/utils/contactPayload.test.ts` y `src/components/ContactForm.test.tsx`.
- `npm run test` / `typecheck` / `lint` verdes.
- Checklist del owner: aplicar migración `0012`, deploy de `contact-notify`, pruebas en vivo (`CHECKLIST-OWNER.md` del track).
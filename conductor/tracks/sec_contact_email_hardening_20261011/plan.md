# Plan: Hardening del envío de email del formulario de contacto

> **Track ID:** `sec_contact_email_hardening_20261011`
> **Spec:** [./spec.md](./spec.md)
> **Status:** ✅ Completado (2026-10-12) — código + migración `0012` aplicada + Edge Function desplegada y verificada en producción.

---

## Fase 1 — SEC-005: validación server-side anti-CRLF y `reply_to` seguro

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T1.1 | Módulo puro `validation.ts` (sin imports Deno) con `validateContactInput`, `hasControlChars`, `isSafeEmail`, `TURNSTILE_ACTION`, `DISPOSABLE_EMAIL_DOMAINS`, `isDisposableEmail`, `isTurnstileResponseValid` | `supabase/functions/contact-notify/validation.ts` | ☑️ |
| T1.2 | Refactor `index.ts`: importar validación, eliminar `validate()`/`LIMITS` locales, `reply_to` solo con `isSafeEmail` | `supabase/functions/contact-notify/index.ts` | ☑️ |
| T1.3 | Paridad cliente: `hasControlChars(name)` en `ContactForm.tsx` y en `validateContactPayload` | `src/components/ContactForm.tsx`, `src/utils/contactPayload.ts` | ☑️ |

## Fase 2 — SEC-006: Turnstile con acción y hostname

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T2.1 | Widget Turnstile envia `action: 'contact'` (constante compartida) | `src/components/Turnstile.tsx` | ☑️ |
| T2.2 | Predicado puro `isTurnstileResponseValid` (success + action + hostname) y su uso en `verifyTurnstile` | `validation.ts`, `index.ts` | ☑️ |

## Fase 3 — SEC-005/007: CHECK constraints + blocklist desechables

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T3.1 | Migración `0012` con CHECK `name`/`email !~ '[[:cntrl:]]'` (idempotente; `message` exenta) | `supabase/migrations/0012_contact_content_hardening.sql` | ☑️ escrita (aplicar: owner) |
| T3.2 | Blocklist `DISPOSABLE_EMAIL_DOMAINS` + `isDisposableEmail` integrada en `validateContactInput` | `validation.ts` | ☑️ |

## Fase 4 — Documentación

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T4.1 | ADR-0002: allowlist por proveedor evaluado y rechazado | `conductor/decisions/0002-allowlist-proveedores-email-rechazado.md` | ☑️ |
| T4.2 | Track completo (spec, plan, index, CHECKLIST-OWNER, metadata) + registro en `tracks.md` | `conductor/tracks/sec_contact_email_hardening_20261011/*` | ☑️ |

## Fase V — Verificación

| # | Tarea | Herramienta | Estado |
|---|-------|-------------|--------|
| V.1 | Tests de la Edge Function (CRLF, blocklist, turnstile) | Vitest (`validation.test.ts`) | ☑️ |
| V.2 | Paridad cliente y widget (tests ContactForm/contactPayload/Turnstile) | Vitest | ☑️ |
| V.3 | Suite completa + typecheck + lint | npm | ☑️ (pendiente run final post-docs) |
| V.4 | Aplicar migración `0012` + deploy `contact-notify` + pruebas en vivo | Supabase SQL Editor + `supabase functions deploy contact-notify --no-verify-jwt` | ☑️ owner — aplicado y verificado en producción (2026-10-12) |

---

## Riesgos

| Riesgo | Mitigación |
|--------|-----------|
| El navegador ya sanitiza CRLF en `<input type="text">` → falsa sensación de seguridad si se confía solo en cliente | La defensa real es la validación **server-side** (POST directo) + CHECK en esquema; la paridad cliente es solo UX |
| `reply_to` omitido para teléfonos/WhatsApp podría sorprender | Es el comportamiento deseado (SEC-005); el email igual llega con asunto y mensaje |
| Blocklist desechable evadible / dominio legítimo listado | Es una mitigación de ruido (Info), documentada; ampliar/editar el Set es de una línea |
| Tokens Turnstile viejos sin `action` (`null`) rechazados post-deploy hasta que repinte el widget | Aceptado: el widget siempre envía `contact`; el usuario reintenta en 3 s (throttle no se consume en errores) |
| Migrar `0012` antes del deploy rompe inserts con CRLF (deseado) | Orden documentado en CHECKLIST-OWNER.md; la vía única de insert ya es la Edge Function validada |
# Plan — Contrato único de contacto compartido

> **Track ID:** `arch_contact_contract_20261012`
> **Spec:** [./spec.md](./spec.md)
> **Status:** ✅ Implementado — pendiente smoke/deploy (V.4/V.5)
> **Reglas:** módulo puro; sin cambio de política; el servidor sigue siendo la autoridad.

---

## Fase T0 — Módulo de contrato

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T0.1 | Crear el contrato: `CONTACT_LIMITS`, `hasControlChars`, patrón de email, `TURNSTILE_ACTION` | `supabase/functions/_shared/contact-contract.ts` (nuevo) | ✅ |
| T0.2 | Test del contrato (límites, control chars, email, acción) | `supabase/functions/_shared/contact-contract.test.ts` (nuevo) | ✅ |
| T0.3 | Importar el contrato desde `validation.ts` y borrar las copias locales | `supabase/functions/contact-notify/validation.ts` | ✅ |

## Fase T1 — Cliente

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T1.1 | `contactPayload.ts` / `contactSafety.ts` / `email.ts` importan el contrato | `src/utils/contactPayload.ts`, `src/utils/contactSafety.ts`, `src/utils/email.ts` | ✅ |
| T1.2 | `Turnstile.tsx` importa `TURNSTILE_ACTION` del contrato | `src/components/Turnstile.tsx` | ✅ |
| T1.3 | `ContactForm` usa `validateContactFields`/`validateContactPayload`; elimina constantes `MAX_*` y la validación a mano | `src/components/ContactForm.tsx` | ✅ |
| T1.4 | Documentar el espejo SQL (`0015`) como sincronizado con el contrato | `supabase/migrations/0015_client_email_valid.sql` (comentario) | ✅ |

## Fase V — Verificación

| # | Tarea | Herramienta | Estado |
|---|-------|-------------|--------|
| V.1 | `npm run test` (suite verde, cobertura ≥80 %) | Vitest | ✅ |
| V.2 | `npm run typecheck` / `npm run lint` | tsc / ESLint | ✅ |
| V.3 | Grep: sin copias de límites/control-chars/regex/acción fuera del contrato | repo | ✅ |
| V.4 | `supabase functions serve contact-notify` (import resuelve) + smoke local | Supabase CLI | ⬜ |
| V.5 | Deploy de la Edge Function + verificación en prod (email normal, CRLF → 400, desechable → 400) | Supabase CLI | ⬜ |
| V.6 | Commit `refactor(arch): contrato único de contacto cliente/Edge Function` + docs del track | git | ✅ |

---

## Riesgos

| Riesgo | Mitigación |
|--------|-----------|
| El import compartido no resuelve en el runtime de Deno al desplegar | Probar con `supabase functions serve` (V.4) antes del deploy; usar `_shared/` |
| Vite no bundlea un archivo fuera de `src/` | Import relativo explícito; verificar build (V.2) |
| El espejo SQL queda desincronizado | Comentario de sincronización + test que fije el patrón del contrato |

# Spec — Contrato único de contacto compartido entre cliente y Edge Function

> **Track ID:** `arch_contact_contract_20261012`
> **Fuente:** Revisión de arquitectura del codebase (candidato C3, fuerza **Worth exploring**).
> **Estado:** ⏳ Pendiente (spec + plan; sin implementar).
> **Vocabulario:** `module` / `interface` / `seam` / `adapter` / `locality` (skill `codebase-design`).

---

## 1. Contexto y objetivo

La política de validación del formulario de contacto es una sola, pero vive copiada en varios lugares a ambos lados del **seam** cliente/Edge Function. Hay **dos adapters reales** que satisfacen la misma política — el navegador y la Edge Function `contact-notify` — por lo que compartir el contrato está justificado (a diferencia de un seam hipotético).

Copias actuales:

- **`CONTACT_LIMITS`** — `src/utils/contactPayload.ts:13-18` y `supabase/functions/contact-notify/validation.ts:19-24` (idénticos; el comentario de `validation.ts:18` dice "compartidos" pero es una copia).
- **`hasControlChars`** — `src/utils/contactSafety.ts:11-17` y `validation.ts:33-39` (byte a byte).
- **`SAFE_EMAIL`** (regex de email) — **cuatro** veces: `src/utils/contactSafety.ts:20`, `src/utils/email.ts:9`, `validation.ts:45` y `supabase/migrations/0015_client_email_valid.sql:32` (misma política en SQL).
- **`TURNSTILE_ACTION`** — `src/components/Turnstile.tsx:26` y `validation.ts:88` (invariante manual "debe coincidir").
- **Re-validación en el formulario** — `ContactForm.tsx:29-32` define `MAX_NAME_LENGTH/MAX_EMAIL_LENGTH/MAX_MESSAGE_LENGTH/MIN_MESSAGE_LENGTH` (duplican `CONTACT_LIMITS`) y `:59-71` valida a mano, para luego validar otra vez vía `validateContactPayload` en `:91-95`.

**Objetivo:** un único módulo de contrato (límites, `hasControlChars`, regex de email, `TURNSTILE_ACTION`) importado por el cliente y por la Edge Function; y que `ContactForm` dependa solo de `validateContactPayload`.

## 2. Functional Requirements

- **FR1 —** Un módulo de contrato exporta `CONTACT_LIMITS`, `hasControlChars`, el patrón de email y `TURNSTILE_ACTION` como fuente única.
- **FR2 —** El cliente (`src/utils/*`) y la Edge Function (`validation.ts`) importan el contrato en vez de re-declararlo.
- **FR3 —** `ContactForm` no re-implementa validación: usa el módulo de contacto (`validateContactFields` para el guard temprano de campos y `validateContactPayload` antes del envío) y `CONTACT_LIMITS` para los `maxLength`; se eliminan sus constantes `MAX_*` privadas.
- **FR4 —** La copia en SQL (`0015`) se documenta explícitamente como **espejo sincronizado** del contrato TS (la DB no puede importar TS), igual que el espejo `compute_brief_status` de SEC-006.

## 3. Non-Functional Requirements

- **NFR1 —** El contrato es un módulo **puro** (sin imports de Deno ni de React), testeable con Vitest.
- **NFR2 —** Sin cambio de comportamiento: mismos límites, mismos rechazos, misma validación server-side (la autoridad sigue siendo el servidor).
- **NFR3 —** El import desde la Edge Function resuelve en el runtime de Deno (`supabase functions serve` / deploy).
- **NFR4 —** `npm run test` / `typecheck` / `lint` verdes; cobertura no baja.

## 4. Acceptance Criteria

- [ ] `CONTACT_LIMITS`, `hasControlChars`, el patrón de email y `TURNSTILE_ACTION` existen en un solo módulo TS.
- [ ] No quedan copias de esos valores en `src/utils/*` ni en `validation.ts` (grep).
- [ ] `ContactForm` no define constantes `MAX_*` propias ni valida fuera de `validateContactPayload`.
- [ ] El espejo SQL está documentado como sincronizado.
- [ ] Suite, typecheck, lint y smoke de la Edge Function verdes.

## 5. Out of Scope

- Cambiar la política de validación (mismos límites y reglas).
- Migrar el regex a un CHECK nuevo en la DB (se mantiene el espejo `0015`).
- Retirar la validación server-side (la autoridad sigue siendo la Edge Function).

## 6. Decisión abierta

- **D1 —** Ubicación del módulo compartido: `supabase/functions/_shared/contact-contract.ts` (importable por ambos con rutas relativas) vs. un `shared/` de nivel raíz. Recomendado: `supabase/functions/_shared/`.

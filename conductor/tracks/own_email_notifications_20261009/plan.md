# Plan: Email propio + Turnstile (reemplazo de Web3Forms)

> **Track ID:** `own_email_notifications_20261009`
> **Spec:** [./spec.md](./spec.md)
> **Status:** ✅ Aprobado (2026-10-09) — Fases A y B completas. Sigue C (Edge Function). El front ya apunta a `contact-notify`; Web3Forms fuera del bundle. **Checklist del dueño pendiente para la Fase E.** Nota: la parte de envPrefix/.env.example/vite-env.d.ts de la Fase D quedó adelantada en B.
> **Reglas:** TDD en lógica pura y en interacciones del front; Edge Function con smoke test local. Commits convencionales; build verde en cada commit.
> **Gate:** Fase E (deploy+envíos reales) requiere confirmación del dueño y sus credenciales/requisitos.

---

## Contexto

Reemplaza Web3Forms por una Supabase Edge Function (`contact-notify`) que valida Turnstile, envía por Zoho SMTP (dominio propio) y deja copia en `contact_messages`. Cierra los leads #4 y #7 de la auditoría. Orden: guardrail (A) → front (B) → función (C) → config (D) → deploy/validación (E) → docs (F).

---

## Fase A — Guardrail y requisitos del dueño

| # | Tarea | Archivos / herramienta | Estado |
|---|-------|------------------------|--------|
| A.1 | Actualizar `fair-use.md`: excepción para `contact-notify` + límites | `conductor/fair-use.md` | ✅ |
| A.2 | Checklist del dueño: DNS Zoho (SPF/DKIM/DMARC), app password, claves Turnstile | `CHECKLIST-OWNER.md` (creado) | ✅ |
| A.3 | Documentar dónde viven los secretos (dashboard de la función) | `tech-stack.md` | ✅ |

---

## Fase B — Validadores y front (TDD)

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| B.1 | TDD: `validateContactPayload`/`buildContactPayload` (límites 80/120/2000) | `src/utils/contactPayload.ts` (+test) | ✅ |
| B.2 | Integrar Turnstile (widget) + POST a la función con manejo de errores | `src/components/ContactForm.tsx` | ✅ |
| B.3 | Eliminar Web3Forms: borrar `formSubmission.ts`(+test), quitar `FORM_ACCESS_KEY` | `src/utils/`, `.env.example`, `src/vite-env.d.ts` | ✅ |
| B.4 | Tests del form + suite | `ContactForm.test.tsx` | ✅ |
| B.5 | Commit `feat(contact): post to edge function with turnstile` | — | ✅ |

---

## Fase C — Edge Function

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| C.1 | Implementar `contact-notify` (CORS, Turnstile siteverify, validación, nodemailer Zoho 465, insert service role con rate-limit del trigger 0007, 200/400/429/500) | `supabase/functions/contact-notify/index.ts` | ⬜ |
| C.2 | Smoke test local (`supabase functions serve`) con secrets dummy | CLI | ⬜ |
| C.3 | Commit `feat(functions): contact-notify with zoho smtp and turnstile` | — | ⬜ |

---

## Fase D — Config y headers

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| D.1 | CSP: `script-src`/`connect-src` += `challenges.cloudflare.com`; `connect-src` += URL de funciones | `vercel.json`, `netlify.toml` | ⬜ |
| D.2 | `.env.example` sin `FORM_ACCESS_KEY`; documentar `TURNSTILE_SITE_KEY` y secretos | `.env.example`, `src/vite-env.d.ts` | ⬜ |
| D.3 | Build/lint/test/typecheck + commit `chore(config): connect contact function and turnstile` | — | ⬜ |

---

## Fase E — Deploy y verificación (dueño)

| # | Tarea | Herramienta | Estado |
|---|-------|-------------|--------|
| E.1 | Deploy de la función + secrets (`supabase functions deploy contact-notify` + dashboard) | Supabase | ⬜ |
| E.2 | Prueba real: mensaje → email a `hola@` (SPF/DKIM/DMARC PASS) + fila en panel | form real | ⬜ |
| E.3 | Verificar rate-limit (7º intento en 1 min rechazado) | form real | ⬜ |
| E.4 | Rotar/eliminar la access key de Web3Forms | Web3Forms | ⬜ |
| E.5 | Checklist final build/lint/test/typecheck | — | ⬜ |

---

## Fase F — Docs y cierre

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| F.1 | `tech-stack.md` (formulario → función + Turnstile; secretos), `tracks.md` | docs | ⬜ |
| F.2 | Commit docs + resumen al usuario | — | ⬜ |

---

## Verificación por fase (protocolo `workflow.md`)

Tras cada fase: resumen al usuario. La **Fase E requiere confirmación explícita** del dueño (deploy, secrets y envíos reales). La **Fase A.2 (DNS/app password/Turnstile) es requisito** para llegar a E.

## Riesgos

| Riesgo | Mitigación |
|--------|-----------|
| Turnstile script fuera de CSP | Fase D.1 |
| Filtrar secretos | Solo dashboard; smoke test con dummies |
| Límites del free tier | Documentados (volumen bajo de un portfolio) |
| DNS de Zoho no propagado | Verificación con cabeceras reales |
| Rate limit depende de `x-forwarded-for` | Turnstile como control autoritativo |
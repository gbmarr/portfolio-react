# Spec — Email propio + Turnstile (reemplazo de Web3Forms)

> **Track ID:** `own_email_notifications_20261009`
> **Fuente:** follow-up del track `security_hardening_20261009` (auditoría run-1, leads #4 anti-abuse y #7 Web3Forms access key).
> **Estado:** ✅ **Completado** (2026-10-10). Funciona en producción: Turnstile + Edge Function `contact-notify` + **Resend API**; Web3Forms retirado.

---

## 1. Contexto y objetivo

La auditoría detectó dos leads que este track cierra de raíz:

- **Lead #4** (`contact-messages/anon-insert-client-only-abuse-controls`): el anti-abuso del form era solo client-side. Mitigado en DB con rate-limit en el trigger (`0007`, luego endurecido a **1 consulta/min/IP** con `0008`) + `subject` null, y **autoritativamente** con Cloudflare Turnstile server-side.
- **Lead #7** (`form-submission/web3forms-access-key-client-bundled`): la key de Web3Forms viajaba en el bundle. Web3Forms retirado del front/env/build.

Objetivo logrado: el envío va a **email propio** (`hola@gabrielmarrero.com.ar`, dominio `gabrielmarrero.com.ar`) vía **Resend API** desde una **Supabase Edge Function** protegida con **Cloudflare Turnstile**. Zoho Mail sigue como receptor.

**Decisión de arquitectura (confirmada 2026-10-09):** se rompe el guardrail "cero serverless" de `fair-use.md` para **una única función acotada**; el guardrail se actualizó con la excepción.

---

## 2. Decisiones confirmadas

| # | Tema | Decisión |
|---|------|----------|
| E1 | Plataforma | **Supabase Edge Function** (Deno), junto a la DB/RLS existentes. |
| E2 | Captcha | **Cloudflare Turnstile** (widget en el form + `siteverify` server-side en la función). |
| E3 | Flujo | **Reemplazo total de Web3Forms**: el form postea directo a la función; no queda fallback. |
| E4 | Guardrail | **`conductor/fair-use.md`** actualizado con la excepción de esta única función. |
| E5 | Proveedor de envío (2026-10-10) | **Resend API** (Bearer key, dominio verificado) — se descartó el canje OAuth de Zoho (app password no entregable + canje del self client con `invalid_code`/HTML roadblock tras 6+ ciclos). |
| E6 | Rate-limit (2026-10-10) | **1 consulta/min/IP** (migración `0008`, reemplaza el 5/min de `0007`). |

---

## 3. Arquitectura

```
ContactForm (React)
  └─ POST https://jntueibgkfwptigpncmh.functions.supabase.co/contact-notify
       { name, email, message, turnstileToken }   (CORS al dominio propio)
        │
        ▼
contact-notify (Supabase Edge Function, Deno)
  1. CORS + parseo del body
  2. Verifica Turnstile  → POST challenges.cloudflare.com/turnstile/v0/siteverify
       (secret TURNSTILE_SECRET ?? TURNSTILE_SECRET_KEY server-side; remoteip = x-forwarded-for)
  3. Valida payload (name ≤80, email ≤120, message 10-2000, token no vacío)
  4. Inserta copia en contact_messages PRIMERO (service role; subject null)
       → trigger 0007/0008: si excede 1/min from la IP → 429 rate-limited
  5. Envía email vía Resend API (Bearer MAIL_PROVIDER_API_KEY)
       POST https://api.resend.com/emails  { from, to, subject, text, reply_to }
       from/to default: hola@gabrielmarrero.com.ar
  Respuestas: 200 ok / 400 (invalid-json|invalid-payload|turnstile) / 429 / 500 (mail-*|db-*)
```

### 5.1 Datos/env (ambos lados)
- **Públicas (bundle):** `TURNSTILE_SITE_KEY` (site key, pública por diseño); URL de la función (fija: `<ref>.functions.supabase.co`).
- **Secretas (solo dashboard → Edge Function Secrets de Supabase):** `TURNSTILE_SECRET`, `MAIL_PROVIDER_API_KEY` (Resend `re_...`), opcionales `MAIL_FROM`/`MAIL_TO` (default `hola@gabrielmarrero.com.ar`). Los `ZOHO_*` quedaron **inertes** tras el pivote a Resend y pueden borrarse.

### 5.2 Config del dueño (2026-10-10, todo hecho)
- DNS: SPF Zoho + DKIM Zoho (receptor) · Resend: **DKIM** + SPF (`include:amazonses.com`) · **DMARC** aplicado (`_dmarc` TXT `v=DMARC1; p=none; rua=mailto:hola@gabrielmarrero.com.ar`).
- Resend: dominio `gabrielmarrero.com.ar` verificado + API key como `MAIL_PROVIDER_API_KEY`.
- Turnstile: widget `portfolio` (hostnames dominio + www + localhost:5173); site key en Vercel, secret en Supabase.

### 5.3 Fair-use (E4)
`fair-use.md`: "cero serverless **salvo la Edge Function `contact-notify`** (email de contacto)" — actualizado.

---

## 4. Fases (todas completas)

### Fase A — Guardrail y requisitos del dueño ✅
`fair-use.md` actualizado + `CHECKLIST-OWNER.md` + secretos documentados en `tech-stack.md`.

### Fase B — Validadores y front (TDD) ✅ commit `b45cc59`
- `src/utils/contactPayload.ts` (+test): `validateContactPayload`/`buildContactPayload`/`contactFunctionUrl`.
- `src/components/Turnstile.tsx` (widget con loader cached en Map).
- `ContactForm.tsx`: Turnstile + POST a la función con 400/429/500; **eliminados** `formSubmission.ts`(+test) y `FORM_ACCESS_KEY`.
- `vite.config.ts`: `envPrefix ['DATABASE_','TURNSTILE_']`.

### Fase C — Edge Function ✅ (2 iteraciones)
- `supabase/functions/contact-notify/index.ts`:
  - v1 (`940ec35`) Zoho/nodemailer → pivote a Zoho Mail API OAuth (`d7c2f13`) → **pivote a Resend** (`4fa0f2a`).
  - Reorden final: Turnstile → **copia DB primero** (429 rate-limited) → **email Resend después**; errores con `detail`.
- C.2 (smoke local): bloqueado en este entorno (sin Deno local/sandbox OS); documentado.

### Fase D — Config y headers ✅
- `b45cc59` envPrefix + `.env.example` + `vite-env.d.ts` (sin `FORM_ACCESS_KEY`) · `a227b02` CSP (script/connect += `challenges.cloudflare.com`; **se retiró `api.web3forms.com`**) · **`f9b68a9`** CSP `frame-src https://challenges.cloudflare.com` (+ test `src/headersConfig.test.ts` con 5 aserciones × plataforma) — arregló el bug del widget Turnstile colgado (error 300030).

### Fase E — Deploy y verificación ✅ (2026-10-10)
- Función deployada (ACTIVE v1): dashboard https://supabase.com/dashboard/project/jntueibgkfwptigpncmh/functions.
- Prueba real **exitosa**: Turnstile renderiza, fila en `contact_messages`/panel, **email llega a `hola@` desde `hola@`** (SPF/DKIM PASS).
- Rate-limit endurecido a 1/min (`97ea6cf` → migración `0008`, aplicada; 2º envío en el mismo minuto → 429).
- Web3Forms eliminado (E.4 ✅).

### Fase F — Docs y cierre ✅
Este spec + `plan.md` + `CHECKLIST-OWNER.md` + `tech-stack.md` + `tracks.md` actualizados; commit docs.

---

## 5. Fuera de alcance

- Plantillas de email transaccional (magic link) — siguen en Supabase Auth.
- Marketing/email masivo.
- Cambios en RLS de las tablas existentes (`0007`/`0008` proveen el rate-limit; la función usa service role solo para insertar filas válidas).
- Storage/uploads.

---

## 6. Riesgos (evaluados)

| Riesgo | Mitigación |
|--------|-----------|
| Turnstile documentado **Add site** vs **Add widget** | Resuelto con el flujo real del dashboard + hostname management |
| Canje OAuth de Zoho (app password/self client) | **Pivote a Resend API** (clave simple, dominio verificado, sin OAuth) |
| CSP bloqueaba iframe de Turnstile | `frame-src` agregado + test de regresión `headersConfig.test.ts` |
| `x-forwarded-for` spoofable | Turnstile es el control autoritativo; rate-limit DB 1/min como mitigación en profundidad |
| Límites free tier (Resend ~100/día) | Volumen bajo de un portfolio; documentado |

---

## 7. Criterios de aceptación (todos cumplidos)

- [x] El form envía a la función; un token de Turnstile inválido es rechazado con 400 (`{"ok":false,"error":"turnstile"}`).
- [x] El email llega a `hola@gabrielmarrero.com.ar` con SPF/DKIM/DMARC OK (dueño verificó; DMARC aplicado).
- [x] La copia aparece en `contact_messages` y en el panel admin.
- [x] Más de 1 envío en 1 min → 429 (rate-limit `0008`); el límite aplica también al canal de la función.
- [x] Web3Forms y `FORM_ACCESS_KEY` eliminados de front/env/build.
- [x] CSP actualizado (Turnstile `script-src`/`connect-src`/`frame-src` + funciones); build/lint/test/typecheck verdes.
- [x] `fair-use.md` actualizado documentando la excepción serverless.
- [x] `tech-stack.md` y `tracks.md` actualizados.

Commits del track: `dd4c18d` PR body del hardening · `b9af713` Fase A · `b45cc59` Fase B · `940ec35`+`d7c2f13`+`4fa0f2a` Edge Function (Zoho→Zoho OAuth→Resend) · `a227b02` Fase D · `f9b68a9` CSP frame-src · `97ea6cf` rate-limit 1/min · docs de cierre.
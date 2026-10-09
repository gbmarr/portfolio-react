# Spec — Email propio + Turnstile (reemplazo de Web3Forms)

> **Track ID:** `own_email_notifications_20261009`
> **Fuente:** follow-up del track `security_hardening_20261009` (auditoría run-1, leads #4 anti-abuse y #7 Web3Forms access key).
> **Estado:** Propuesto — pendiente de aprobación del usuario (spec + plan).

---

## 1. Contexto y objetivo

La auditoría detectó dos leads que este track cierra de raíz:

- **Lead #4** (`contact-messages/anon-insert-client-only-abuse-controls`): el anti-abuso del form de contacto era solo client-side. Ya se mitigó en DB (rate-limit 5/min/IP + `subject` null, migración `0007`), pero sigue siendo **mitigatorio** (el header `x-forwarded-for` se puede falsificar).
- **Lead #7** (`form-submission/web3forms-access-key-client-bundled`): la key de Web3Forms viaja en el bundle del cliente; el proveedor no permite domain-lock y el spam puede consumir la cuota (250/mes).

Objetivo: **mover el envío del email propio** (`hola@gabrielmarrero.com.ar` vía Zoho Mail con el dominio `gabrielmarrero.com.ar`) a una **Supabase Edge Function** protegida con **Cloudflare Turnstile**, retirando Web3Forms y su access key del proyecto.

**Decisión de arquitectura (confirmada 2026-10-09):** se rompe el guardrail "cero serverless" de `fair-use.md` para **una única función acotada**; el guardrail se actualiza para documentar esta excepción.

---

## 2. Decisiones confirmadas (2026-10-09)

| # | Tema | Decisión |
|---|------|----------|
| E1 | Plataforma | **Supabase Edge Function** (Deno), junto a la DB/RLS existentes. |
| E2 | Captcha | **Cloudflare Turnstile incluido** en el mismo track (widget invisible en el form + validación del token en la función). |
| E3 | Flujo | **Reemplazo total de Web3Forms**: el form postea directo a la función; no queda fallback. |
| E4 | Guardrail | **Actualizar `conductor/fair-use.md`** para permitir esta única función (con límites y justificación). |

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
       (secret TURNSTILE_SECRET server-side; remoteip = x-forwarded-for)
  3. Valida payload (mismos límites que la DB: name 1-80, email 3-120, message 10-2000)
  4. Envía email por Zoho SMTP (nodemailer; 465/SSL; app password)
       from: hola@gabrielmarrero.com.ar ; to: hola@gabrielmarrero.com.ar (inbox del dueño)
  5. Inserta copia en contact_messages (service role; pasa por el trigger 0007
       → el rate-limit 5/min/IP también cubre este canal; si rechaza, responde 429)
```

### 5.1 Datos/env (ambos lados)
- **Públicas (bundle):** `TURNSTILE_SITE_KEY` (site key de Cloudflare, pública por diseño); URL de la función (fija: `<ref>.functions.supabase.co`).
- **Secretas (solo dashboard → Edge Function):** `TURNSTILE_SECRET`, `ZOHO_SMTP_HOST` (`smtp.zoho.com`), `ZOHO_SMTP_PORT` (`465`), `ZOHO_SMTP_USER` (`hola@gabrielmarrero.com.ar`), `ZOHO_APP_PASSWORD` (app password, nunca en el bundle).

### 5.2 Config de Zoho (tareas del dueño, requisito del track)
- DNS del dominio: registros **SPF** (`v=spf1 include:zoho.com ~all`), **DKIM** (Zoho genera el selector) y **DMARC**.
- Generar **app password** para SMTP en la cuenta Zoho.
- Verificación: `mail-tester` o enviar a una casilla auxiliar y revisar cabeceras (SPF/DKIM/DMARC PASS).

### 5.3 Fair-use (E4)
Actualizar `conductor/fair-use.md`: el proyecto pasa de "cero serverless" a "cero serverless **salvo la Edge Function `contact-notify`** (email de contacto)", documentando límites del free tier de Supabase Functions e invocaciones mensuales y la justificación de seguridad.

---

## 4. Fases

### Fase A — Guardrail y requisitos del dueño (sin código)
- `fair-use.md` actualizado (E4).
- Checklist de requisitos: DNS Zoho (SPF/DKIM/DMARC), app password, claves Turnstile (site+secret), deployment del Edge Function habilitado en el plan.

### Fase B — Validadores y front (TDD)
- Módulo puro `src/utils/contactPayload.ts`: `validateContactPayload` (límites 80/120/2000, regex email) + `buildContactPayload` (armado del POST). Con tests (`contactPayload.test.ts`).
- `ContactForm.tsx`: integra **Turnstile** (script + widget) y postea a la función con `fetch`; maneja errores 400/429/500 con mensajes del `panelCopy`; **quita** `submitContactForm` (Web3Forms) y `FORM_ACCESS_KEY`.
- Eliminar `src/utils/formSubmission.ts` y su test.
- Tests del form actualizados.

### Fase C — Edge Function
- `supabase/functions/contact-notify/index.ts` (Deno):
  1. CORS al dominio propio (`gabrielmarrero.com.ar`, `www`, `localhost:5173` dev).
  2. `siteverify` con Turnstile; fallo → 400.
  3. Validar payload con las mismas reglas que el front/DB.
  4. `nodemailer` (import `npm:`) → Zoho SMTP 465/SSL con app password; asunto `Nuevo mensaje del portfolio — {name}`; cuerpo con name/email/message y hora.
  5. Insertar copia en `contact_messages` vía **service role** (supabase-js en Deno): las filas pasan por el trigger `0007` (rate-limit + `subject` null); si el trigger la rechaza → 429.
  6. Respuestas: 200 ok / 400 payload o turnstile inválido / 429 rate limit / 500 SMTP o DB.
- Smoke test con `supabase functions serve` y dummy secrets (sin enviar emails reales).

### Fase D — Config y headers
- `vercel.json` + `netlify.toml`: CSP `script-src` + `connect-src` += `https://challenges.cloudflare.com`; `connect-src` += `https://jntueibgkfwptigpncmh.functions.supabase.co`.
- `.env.example`: eliminar `FORM_ACCESS_KEY`; documentar `TURNSTILE_SITE_KEY` (público) y que los secretos Zoho/Turnstile viven en el dashboard del Edge Function.
- `vite.config.ts`: revisar `envPrefix` (queda `DATABASE_` + agregar `TURNSTILE_` o usar el convenio `PUBLIC_*` si ya se implementó).

### Fase E — Deploy y verificación (dueño)
- Subir la función (`supabase functions deploy contact-notify`) + secrets del dashboard.
- Prueba real: enviar 1 mensaje → llega a `hola@` (SPF/DKIM/DMARC PASS) y aparece en el panel; el 7º intento en 1 min → rechazado (429/DB).
- Retirar Web3Forms del proyecto; rotar/eliminar la access key.

### Fase F — Docs y cierre
- `tech-stack.md` (formulario → Zoho + Turnstile + función única), `tracks.md`, criterios de aceptación y status.
- Resumen y commit docs.

---

## 5. Fuera de alcance

- Plantillas de email transaccional (magic link) — siguen en Supabase Auth.
- Marketing/email masivo.
- Cambios en RLS de las tablas existentes (`0007` ya provee el rate-limit; la función usa service role solo para insertar filas válidas).
- Storage/uploads.
- Migrar magic link a función propia.

---

## 6. Riesgos

| Riesgo | Mitigación |
|--------|-----------|
| Turnstile script requerido por CSP | Agregar `challenges.cloudflare.com` a `script-src`/`connect-src` (Fase D) |
| Filtrar secretos de Zoho/Turnstile | Solo en el dashboard (secretos de la función); nunca en el bundle |
| Límites del free tier de funciones | Documentarlos; el volumen de un portfolio es bajo |
| Propagación DNS de Zoho | Checklist del dueño con verificación (mail-tester/cabeceras) |
| `x-forwarded-for` spoofable | Turnstile es el control autoritativo; el rate-limit DB queda como mitigación en profundidad |
| CORS incorrecto rompe el form | Allowlist exacta del dominio propio + localhost dev |

---

## 7. Criterios de aceptación

- [ ] El form envía a la función; un token de Turnstile inválido es rechazado con 400.
- [ ] El email llega a `hola@gabrielmarrero.com.ar` con SPF/DKIM/DMARC OK (dueño verifica).
- [ ] La copia aparece en `contact_messages` y en el panel admin.
- [ ] Más de 5 envíos en 1 min → rechazo (429); el límite aplica también al canal de la función.
- [ ] Web3Forms y `FORM_ACCESS_KEY` eliminados de front/env/build.
- [ ] CSP actualizado (Turnstile + funciones); build/lint/test/typecheck verdes.
- [ ] `fair-use.md` actualizado documentando la excepción serverless.
- [ ] `tech-stack.md` y `tracks.md` actualizados.
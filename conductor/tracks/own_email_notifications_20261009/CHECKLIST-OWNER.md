# Checklist del dueño — track `own_email_notifications_20261009`

> Prerequisitos para la **Fase E** (deploy + envíos reales). Actualizado al estado reportado por el dueño (2026-10-09).
> Secretos: **solo viven en el dashboard de Supabase** (Edge Functions → Secrets), nunca en el repo.

---

## 1. Zoho Mail (dominio `gabrielmarrero.com.ar`) — envío vía Zoho Mail API (OAuth2)

- [x] Dominio verificado en Zoho Mail (registro de verificación en la zona DNS de `gabrielmarrero.com.ar`).
- [x] **SPF** — registro TXT en DNS:
      `v=spf1 include:zoho.com ~all`
- [x] **DKIM** — clave generada en Zoho y TXT agregado (selector default: `zoho._domainkey`).
- [ ] **DMARC** (recomendado) — registro TXT (name `_dmarc`, type TXT, value):
      `v=DMARC1; p=none; rua=mailto:hola@gabrielmarrero.com.ar`
- [x] **OAuth2 (self client)**: Self Client `portfolio-contact` creado en Zoho API Console (`api-console.zoho.com`); Client ID y Client Secret anotados.
- [x] **Refresh Token** generado con scope `ZohoMail.messages.ALL` autorizando `hola@gabrielmarrero.com.ar`.
- [x] Región: se usó `api-console.zoho.com` (`.com` → defaults `accounts.zoho.com`/`mail.zoho.com`; solo hace falta `ZOHO_API_BASE`/`ZOHO_MAIL_BASE` si la cuenta es de otra región).

## 2. Cloudflare Turnstile

- [x] Widget creado en Cloudflare Dashboard → Turnstile → **Add widget**, con hostnames: `gabrielmarrero.com.ar`, `www.gabrielmarrero.com.ar` y `localhost:5173` (dev).
- [x] Claves guardadas: **Site Key** → `TURNSTILE_SITE_KEY` (env público, ya cargado en Vercel) · **Secret Key** → `TURNSTILE_SECRET` (solo dashboard de Supabase, ya cargado).

## 3. Supabase

- [ ] Confirmar que el plan del proyecto incluye Edge Functions (free tier ~500K invocations/mes; verificar Project Settings/Billing). Project ref `jntueibgkfwptigpncmh` → `https://jntueibgkfwptigpncmh.functions.supabase.co`.
- [x] (Fase E) Secrets de la función cargados (dashboard o `supabase secrets set`):
      `TURNSTILE_SECRET`, `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, `ZOHO_REFRESH_TOKEN`
      (opcionales por región/entrega: `ZOHO_API_BASE`, `ZOHO_MAIL_BASE`, `ZOHO_NOTIFY_TO`).
- [ ] (Fase E.1) Deploy: `supabase functions deploy contact-notify --no-verify-jwt`.
- [ ] (Fase E.2/E.3) Tras el primer envío real, revisar cabeceras del email: **SPF/DKIM/DMARC PASS** + fila en el panel + 7º envío en 1 min rechazado (rate-limit `0007` → 429).

## 4. Web3Forms (Fase E.4)

- [x] Access key rotada/eliminada: se quitó `FORM_ACCESS_KEY` (`.env.local` y env de Vercel) y se eliminó el formulario en Web3Forms.
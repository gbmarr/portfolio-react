# Checklist del dueño — track `own_email_notifications_20261009`

> Prerequisitos para la **Fase E** (deploy + envíos reales). Actualizado al estado reportado por el dueño (2026-10-09).
> Secretos: **solo viven en el dashboard de Supabase** (Edge Functions → Secrets), nunca en el repo.

---

## 1. Envío por Resend (dominio `gabrielmarrero.com.ar`) — pivote 2026-10-10
> Zoho Mail sigue como **receptor** (SPF admite varios `include`); el envío saliente lo hace Resend.

- [x] Dominio verificado en Zoho Mail (receptor, registro de verificación en la zona DNS).
- [x] **SPF Zoho** — `v=spf1 include:zoho.com ~all`.
- [x] **DKIM Zoho** — TXT agregado (selector `zoho._domainkey`).
- [ ] **DMARC** (recomendado) — registro TXT (name `_dmarc`, type TXT, value):
      `v=DMARC1; p=none; rua=mailto:hola@gabrielmarrero.com.ar`
- [ ] **Resend**: crear cuenta (resend.com, free ~100 emails/día) → Domains → **Add Domain** `gabrielmarrero.com.ar` → agregar en DNS los records que da Resend: un **DKIM** TXT (registro `resend._domainkey` o según indique) y el **SPF** que incluye `include:amazonses.com` (sumándolo a los de Zoho) → esperar **Verified**.
- [ ] **API Key de Resend** (Dashboard → API Keys → Create) → se guarda como secret `MAIL_PROVIDER_API_KEY` (solo dashboard de Supabase).

## 2. Cloudflare Turnstile

- [x] Widget creado en Cloudflare Dashboard → Turnstile → **Add widget**, con hostnames: `gabrielmarrero.com.ar`, `www.gabrielmarrero.com.ar` y `localhost:5173` (dev).
- [x] Claves guardadas: **Site Key** → `TURNSTILE_SITE_KEY` (env público, ya cargado en Vercel) · **Secret Key** → `TURNSTILE_SECRET` (solo dashboard de Supabase, ya cargado).

## 3. Supabase

- [ ] Confirmar que el plan del proyecto incluye Edge Functions (free tier ~500K invocations/mes; verificar Project Settings/Billing). Project ref `jntueibgkfwptigpncmh` → `https://jntueibgkfwptigpncmh.functions.supabase.co`.
- [x] (Fase E) Secrets de la función cargados (dashboard o `supabase secrets set`):
      `TURNSTILE_SECRET`, `MAIL_PROVIDER_API_KEY`
      (opcionales: `MAIL_FROM`, `MAIL_TO`, default `hola@gabrielmarrero.com.ar`).
      Los `ZOHO_*` quedaron **inertes** tras el pivote a Resend y pueden borrarse.
- [ ] (Fase E.1) Deploy: `supabase functions deploy contact-notify --no-verify-jwt`.
- [ ] (Fase E.2/E.3) Tras el primer envío real, revisar cabeceras del email: **SPF/DKIM/DMARC PASS** + fila en el panel + 7º envío en 1 min rechazado (rate-limit `0007` → 429).

## 4. Web3Forms (Fase E.4)

- [x] Access key rotada/eliminada: se quitó `FORM_ACCESS_KEY` (`.env.local` y env de Vercel) y se eliminó el formulario en Web3Forms.
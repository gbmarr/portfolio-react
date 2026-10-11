# Checklist del dueño — track `own_email_notifications_20261009`

> Estado final: **todo completado (2026-10-10)** — track cerrado y verificado en producción.
> Secretos: **solo viven en el dashboard de Supabase** (Edge Functions → Secrets), nunca en el repo.

---

## 1. Envío por Resend (dominio `gabrielmarrero.com.ar`)
> Zoho Mail sigue como **receptor** (SPF admite varios `include`); el envío saliente lo hace **Resend**.

- [x] Dominio verificado en Zoho Mail (receptor).
- [x] **SPF Zoho** — `v=spf1 include:zoho.com ~all`.
- [x] **DKIM Zoho** — TXT agregado (selector `zoho._domainkey`).
- [x] **DMARC** — `_dmarc` TXT: `v=DMARC1; p=none; rua=mailto:hola@gabrielmarrero.com.ar` (aplicado 2026-10-10).
- [x] **Resend**: cuenta creada, dominio `gabrielmarrero.com.ar` **verificado** (DKIM + SPF con `include:amazonses.com` agregados en DNS).
- [x] **API Key de Resend** creada y cargada como secret `MAIL_PROVIDER_API_KEY` (solo dashboard de Supabase).

## 2. Cloudflare Turnstile

- [x] Widget `portfolio` creado → Turnstile → **Add widget**, hostnames: `gabrielmarrero.com.ar`, `www.gabrielmarrero.com.ar` y `localhost:5173`.
- [x] Claves: **Site Key** → `TURNSTILE_SITE_KEY` (Vercel) · **Secret Key** → `TURNSTILE_SECRET` (Supabase). Verificado: el widget renderiza y el `siteverify` pasa server-side.

## 3. Supabase

- [x] Plan con Edge Functions (la función está **ACTIVE**).
- [x] Secrets de la función cargados: `TURNSTILE_SECRET`, `MAIL_PROVIDER_API_KEY` (opcionales `MAIL_FROM`/`MAIL_TO`, default `hola@gabrielmarrero.com.ar`).
      La plataforma inyecta `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` (no tocar). Los `ZOHO_*` quedaron **inertes** — borrables.
- [x] Deploy: `supabase functions deploy contact-notify --no-verify-jwt` (ACTIVE v1).
- [x] Verificación real: **email llega a `hola@gabrielmarrero.com.ar`** desde `hola@` (SPF/DKIM PASS; DMARC aplicado) + **fila en el panel** + **2º envío en el mismo minuto → 429** (rate-limit `0008`, 1/min).

## 4. Web3Forms

- [x] Eliminado: `FORM_ACCESS_KEY` fuera de `.env.local`/Vercel; formulario borrado en Web3Forms; `api.web3forms.com` fuera del CSP.
# Checklist del dueño — track `own_email_notifications_20261009`

> Prerequisitos que tenés que tener listos antes de llegar a la **Fase E** (deploy + envíos reales).
> Marcalos con `[x]` cuando estén.
> Secretos: **solo viven en el dashboard de Supabase** (Edge Functions → Secrets), nunca en el repo.

---

## 1. Zoho Mail (dominio `gabrielmarrero.com.ar`) — envío vía Zoho Mail API (OAuth2)

- [ ] Dominio verificado en Zoho Mail (registro de verificación en la zona DNS de `gabrielmarrero.com.ar`).
- [ ] **SPF** — registro TXT en DNS:
      `v=spf1 include:zoho.com ~all`
- [ ] **DKIM** — generar la clave en Zoho (Control Panel → Mail → Domain → DKIM) y agregar el TXT que Zoho te da (selector default: `zoho._domainkey`).
- [ ] **DMARC** (recomendado) — registro TXT:
      `v=DMARC1; p=none; rua=mailto:hola@gabrielmarrero.com.ar`
- [ ] **OAuth2 (self client)**: en Zoho API Console (`https://api-console.zoho.com`, región según tu cuenta — `.com`/`.eu`/etc.) → Client → **Self Client** → Create (nombre `portfolio-contact`) → anotar **Client ID** y **Client Secret**.
- [ ] Generar el **Refresh Token**: en el self client, opción **Generate Token** / Generate Refresh Token con scope `ZohoMail.messages.ALL`, autorizando con `hola@gabrielmarrero.com.ar`. Copiar el refresh token (no expira salvo revocación).
- [ ] Anotar la región correcta de tu cuenta Zoho (por si hace falta `ZOHO_API_BASE`/`ZOHO_MAIL_BASE`, p. ej. `.eu`).

## 2. Cloudflare Turnstile

- [ ] Crear un sitio en Cloudflare Dashboard → **Turnstile** → "Add site", hostnames: `gabrielmarrero.com.ar`, `www.gabrielmarrero.com.ar`, y `localhost:5173` (para dev).
- [ ] Guardar las claves: **Site Key** (pública → irá en el cliente) y **Secret Key** (solo dashboard como `TURNSTILE_SECRET`).

## 3. Supabase

- [ ] Confirmar que el plan del proyecto incluye Edge Functions (el free tier incluye ~500K invocations/mes; verificar en Project Settings/Billing). Project ref: `jntueibgkfwptigpncmh` → URL de funciones `https://jntueibgkfwptigpncmh.functions.supabase.co`.
- [ ] (Fase E) Definir los secretos de la función en el dashboard (o `supabase secrets set`):
      `TURNSTILE_SECRET`, `ZOHO_SMTP_HOST=smtp.zoho.com`, `ZOHO_SMTP_PORT=465`,
      `ZOHO_SMTP_USER=hola@gabrielmarrero.com.ar`, `ZOHO_APP_PASSWORD`.
- [ ] (Fase E) Tras el primer envío real, revisar cabeceras del email para confirmar **SPF/DKIM/DMARC PASS**.

## 4. Después de que el flujo funcione (Fase E.4)

- [ ] Rotar/eliminar la access key de Web3Forms (dejar de usarla; el formulario ya no la envía).
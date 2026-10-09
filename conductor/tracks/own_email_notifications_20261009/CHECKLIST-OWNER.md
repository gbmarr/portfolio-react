# Checklist del dueño — track `own_email_notifications_20261009`

> Prerequisitos que tenés que tener listos antes de llegar a la **Fase E** (deploy + envíos reales).
> Marcalos con `[x]` cuando estén.
> Secretos: **solo viven en el dashboard de Supabase** (Edge Functions → Secrets), nunca en el repo.

---

## 1. Zoho Mail (dominio `gabrielmarrero.com.ar`)

- [ ] Dominio verificado en Zoho Mail (registro de verificación en la zona DNS de `gabrielmarrero.com.ar`).
- [ ] **SPF** — registro TXT en DNS:
      `v=spf1 include:zoho.com ~all`
- [ ] **DKIM** — generar la clave en Zoho (Control Panel → Mail → Domain → DKIM) y agregar el TXT que Zoho te da (selector default: `zoho._domainkey`).
- [ ] **DMARC** (recomendado) — registro TXT:
      `v=DMARC1; p=none; rua=mailto:hola@gabrielmarrero.com.ar`
- [ ] **App password**: con la *Two-Factor Authentication* activada, generar una application-specific password para SMTP (Zoho Account → Security → App Passwords). Es el único valor de `ZOHO_APP_PASSWORD`.
- [ ] Anotar los valores SMTP: `smtp.zoho.com`, puerto `465` (SSL). Verificar la región correcta de tu cuenta (US/EU/IN/otra).

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
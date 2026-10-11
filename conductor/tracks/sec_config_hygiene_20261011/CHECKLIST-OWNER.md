# CHECKLIST-OWNER — Higiene de configuración (SEC-009)

> Track: `sec_config_hygiene_20261011` · Código implementado y commiteado. Estás leyendo los pasos de *deploy/verificación* que solo puede hacer el dueño del proyecto.

## 1. Cambios incluidos en este track

| Área | Cambio | Archivo |
|---|---|---|
| HSTS | `Strict-Transport-Security: max-age=63072000` **declarado** (antes solo lo servía Vercel por defecto, sin reproducibilidad) | `vercel.json`, `netlify.toml` |
| `envPrefix` | Migrado de `['DATABASE_','ARS_','TURNSTILE_']` → **`['PUBLIC_']`**: solo las vars `PUBLIC_*` se inlinean en el bundle. Cierra el follow-up D4 y elimina el riesgo de inlinear un secreto con prefijo coincidente. | `vite.config.ts`, `src/vite-env.d.ts`, `.env.example` |
| Env vars renombradas | `DATABASE_URL` → `PUBLIC_SUPABASE_URL` · `DATABASE_PUBLISHABLE_KEY` → `PUBLIC_SUPABASE_PUBLISHABLE_KEY` · `TURNSTILE_SITE_KEY` → `PUBLIC_TURNSTILE_SITE_KEY` · `ARS_RATE` → `PUBLIC_ARS_RATE` | `src/lib/supabase.ts`, `src/utils/contactPayload.ts`, `src/data/estimate.ts`, `src/components/ContactForm.tsx`, `src/lib/auth.tsx` (mensaje de error) |
| Docs | Retiradas las referencias a Web3Forms de `conductor/servicios.md` (las referencias históricas quedan en los tracks viejos como registro) | `conductor/servicios.md`, `conductor/tech-stack.md`, `README.md` |
| `connect-src` | Ya estaba acotado al ref exacto (SEC-008); este track solo documenta el estado actual. | — |

## 2. Pasos del dueño

### 2.1 Renombrar env vars en los hosts (IMPORTANTE — antes o junto con el deploy)
El código nuevo espera nombres `PUBLIC_*`. En **Vercel** (y Netlify si se usa) y en tu `.env.local`:

- [ ] `DATABASE_URL` → `PUBLIC_SUPABASE_URL`
- [ ] `DATABASE_PUBLISHABLE_KEY` → `PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- [ ] `TURNSTILE_SITE_KEY` → `PUBLIC_TURNSTILE_SITE_KEY`
- [ ] `ARS_RATE` → `PUBLIC_ARS_RATE` (si está definida)

> Si no se renombran antes de desplegar, la app usará los placeholders de "no configurado" (login/contacto no operativos) — el deploy y el rename deben ir juntos.

### 2.2 HSTS
- [ ] Tras el deploy, verificar con curl/HEAD que el header se sirve y que **no** duplica/HSTS inválido:

```bash
curl -sI https://gabrielmarrero.com.ar | findstr /i "strict-transport-security"
```

Debe ver `Strict-Transport-Security: max-age=63072000` (Vercel puede anteponer el suyo con el mismo valor — si aparece duplicado, revisar; el valor debe ser idéntico).

### 2.3 Verificación funcional
- [ ] Login magic link, panel admin y formulario de contacto siguen operando (confirma que `PUBLIC_SUPABASE_URL`/`PUBLIC_SUPABASE_PUBLISHABLE_KEY`/`PUBLIC_TURNSTILE_SITE_KEY` están bien).
- [ ] El estimador usa `PUBLIC_ARS_RATE` (si está definida) para la aproximación en pesos.
- [ ] `npm run test` local en verde (468 tests) — ya verificado en el track.

## 3. Notas

- **`style-src 'unsafe-inline'`** se conserva a propósito: React emite estilos en línea (atributo `style`) y no hay `script-src 'unsafe-inline'`. No se toca.
- Las referencias viejas a `DATABASE_URL`/`ARS_RATE` en **tracks ya cerrados** (`ars_rate_config_20261011`, `own_email_notifications_20261009`, etc.) son registros históricos de decisiones de ese momento; no se reescriben.
- Si en el futuro se agrega Realtime: añadir el `wss://` exacto al `connect-src` en `vercel.json`/`netlify.toml` y su test en `src/headersConfig.test.ts`.
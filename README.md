# Gabriel Marrero — Portfolio & Gestión de clientes

Sitio público de servicios web para PyMEs (portfolio + landing + estimador de presupuesto + contacto) con un **sistema de gestión** integrado: panel de administración y portal de clientes con seguimiento de proyectos. En producción en **https://gabrielmarrero.com.ar** · Repo: [github.com/gbmarr/portfolio-react](https://github.com/gbmarr/portfolio-react).

> Documentación de producto y decisiones: [`conductor/product.md`](conductor/product.md) · Stack técnico: [`conductor/tech-stack.md`](conductor/tech-stack.md).

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React 19, TypeScript, Vite 8, Tailwind CSS 4 |
| Routing | React Router 7 |
| Backend | Supabase (Postgres + Auth + RLS + Edge Functions en Deno) |
| Formulario de contacto | Cloudflare Turnstile + Edge Function `contact-notify` + Resend |
| Calidad | Vitest (Testing Library), ESLint, Prettier |
| Deploy | Vercel (compatible Netlify) |

## Superficies del sistema

| Ruta | Superficie | Acceso |
|------|-----------|--------|
| `/` | Landing pública (servicios, casos, estimador, contacto) | Público |
| `/login` | Login del cliente (magic link) | Público |
| `/acceso-admin` | Login del administrador | **Interna** (no vinculada en la landing) |
| `/admin/*` | Panel admin: dashboard, proyectos, clientes, mensajes | Requiere rol admin |
| `/panel/*` | Portal del cliente: proyectos y brief | Requiere cliente autenticado |

Las superficies privadas (`/login`, `/acceso-admin`, `/admin/*`, `/panel/*`) están excluidas de indexación (`X-Robots-Tag: noindex` en headers + meta tags). Todo el texto del sitio vive en español en `src/data/` (`copy.ts`, `profile.ts`, `cases.ts`, `estimate.ts`).

## Scripts

| Script | Comando | Descripción |
|--------|---------|-------------|
| `dev` | `npm run dev` | Servidor de desarrollo (puerto 5173) |
| `build` | `npm run build` | Typecheck + build de producción (`tsc -b && vite build`) |
| `preview` | `npm run preview` | Previsualizar el build local |
| `lint` | `npm run lint` | ESLint |
| `format` | `npm run format` | Prettier (escribir) |
| `format:check` | `npm run format:check` | Prettier (solo verificar) |
| `typecheck` | `npm run typecheck` | `tsc -b` |
| `test` | `npm run test` | Vitest (todos los tests) |
| `test:watch` | `npm run test:watch` | Vitest en modo watch |
| `coverage` | `npm run coverage` | Vitest con reporte de cobertura (umbral ≥ 80 %) |

## Setup local

Prerrequisitos: Node.js y `npm`, cuenta de [Supabase](https://supabase.com), [Cloudflare Turnstile](https://dash.cloudflare.com) y acceso al proyecto.

1. **Instalar dependencias**

   ```bash
   npm install
   ```

2. **Configurar variables de entorno**

   ```bash
   cp .env.example .env.local
   ```

   Completá en `.env.local`:
   - `DATABASE_URL` y `DATABASE_PUBLISHABLE_KEY`: valores *publishable* de tu proyecto Supabase (Settings → API). Estos prefijos se inlinean en el bundle: **son públicos por diseño**; los secretos nunca van acá.
   - `TURNSTILE_SITE_KEY`: Site Key de Cloudflare Turnstile (hostnames del sitio + `localhost:5173`).
   - `ARS_RATE` (opcional): cotización USD→ARS para el estimador; default `1400`.

   Referencia completa y aviso de seguridad: [`.env.example`](.env.example).

3. **Aplicar migraciones de base de datos**

   Ejecutá los archivos de `supabase/migrations/` en el SQL Editor de Supabase (RLS, tenancy por email del cliente, rate-limit del formulario).

4. **Deploy de la Edge Function de contacto**

   ```bash
   supabase functions deploy contact-notify --no-verify-jwt
   ```

   Cargá los secrets en **Supabase → Edge Functions → Secrets** (nunca en el repo): `TURNSTILE_SECRET` y `MAIL_PROVIDER_API_KEY`. El checklist completo del dueño (SPF/DKIM/DMARC, Resend, Turnstile) está en [`conductor/tracks/own_email_notifications_20261009/CHECKLIST-OWNER.md`](conductor/tracks/own_email_notifications_20261009/CHECKLIST-OWNER.md).

5. **Levantar el entorno**

   ```bash
   npm run dev
   ```

## Deploy

- **Vercel** (primario): `vercel.json` ya define el rewrite SPA para todas las rutas y los headers de seguridad (CSP + noindex de superficies privadas). Variables de entorno del host: mismas de `.env.local` (publicables por diseño: `DATABASE_*`, `TURNSTILE_SITE_KEY`, `ARS_RATE`). Las secrets de producción (`TURNSTILE_SECRET`, `MAIL_PROVIDER_API_KEY`) viven solo en Supabase.
- **Netlify**: `netlify.toml` es alternativo equivalente (rewrite + headers).

## Documentación de referencia

- [`conductor/product.md`](conductor/product.md) — visión y estado del producto.
- [`conductor/tech-stack.md`](conductor/tech-stack.md) — arquitectura, Supabase, hosting y tooling.
- [`conductor/tracks.md`](conductor/tracks.md) — registro de tracks (features/refactors documentados con spec + plan).
- [`.env.example`](.env.example) — todas las variables de entorno y su seguridad.

---

> Los paneles `/admin/*` y `/acceso-admin` son **superficies internas de gestión**: no están publicadas ni enlazadas desde la landing, y no deben usarse por terceros.
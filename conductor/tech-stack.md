# Tech Stack: Junior Fullstack Developer Portfolio

## Frontend

- **React 19** (SPA) — component-based UI for the portfolio (Vite scaffold, installed 19.2.8).
- **Vite** — fast development server and build tooling.
- **TypeScript** — type-safe code that showcases modern frontend practices. (Recommended)
- **React Router** — routing para `/login` (acceso clientes), `/acceso-admin` (acceso de gestión), `/admin/*` (panel admin) y `/panel/*` (panel del cliente).

## Styling

- **Tailwind CSS** — utility-first CSS for a consistent dark, modern UI with rapid iteration.

## Backend

- **Supabase** — Backend-as-a-Service con Postgres + Auth + Storage + RLS.
  - **Auth**: 
    - Clientes: solo enlace mágico en `/login`.
    - Admin: email+contraseña en `/acceso-admin` (path oculto, no publicado). **Passkey login desactivado** (2026-10-09, Fase K del track `security_hardening_20261009`): se quitó el flag `experimental: { passkey: true }`, el botón de login, la ruta `/admin/seguridad` y su UI/tests. Motivo: Supabase no ofrece step-up/AAL para passkeys y un re-auth client-side es bypassable (llamada directa a la API con una sesión robada).
      - Para **reactivar** passkeys en el futuro: habilitarlas en el dashboard (Authentication → Passkeys) y configurar **RP ID = dominio registrable** (p. ej. `gabrielmarrero.com.ar`, no `*.vercel.app`); RP Origins = orígenes de producción + `http://localhost:5173` para dev. Cambiar el RP ID invalida las passkeys existentes; habría que **re-registrarlas**.
    - **URL Configuration (dashboard)** — de acá depende la redirección del magic link (Authentication → URL Configuration):
      - **Site URL**: `https://gabrielmarrero.com.ar` (destino de *fallback* cuando el `redirect_to` no está en la lista de permitidos).
      - **Redirect URLs** permitidas: `https://gabrielmarrero.com.ar/**`, `https://www.gabrielmarrero.com.ar/**`, `http://localhost:5173/**` (dev local de Vite).
      - El código pasa `emailRedirectTo: \`${window.location.origin}/login\`` (`src/lib/auth.tsx`). Si el origen no está en la lista, Supabase cae al **Site URL** — por eso el Site URL debe ser producción y no `localhost`, o el enlace del email llega con el dominio equivocado.
      - Las **plantillas de email** (Magic Link) no son editables en el plan free salvo configurando SMTP propio; no es necesario: la plantilla por defecto usa `{{ .ConfirmationURL }}`, que respeta el redirect.
      - **No** versionar esta config con `supabase config push` (no existe `config pull` y empujaría ajustes que podrían pisar los de la nube); se administra en el dashboard y se documenta acá.
  - **Base de datos**: `profiles`, `projects`, `project_stages`, `project_briefs`, `milestone_approvals`, `contact_messages`.
  - **RLS (Row Level Security)**: el cliente solo ve sus proyectos/etapas/brief/decisiones; solo el admin escribe.
  - **Migraciones** (`supabase/migrations/`, aplicar con `supabase db push`): `0001_init.sql` (esquema base), `0002_drop_billing.sql` (elimina la tabla `payments` y las columnas `projects.amount/currency` por la estrategia fair-use), `0003_client_brief.sql` (tabla `project_briefs`), `0004_project_completion.sql` (`projects.completed_at` + trigger), `0005_security_hardening.sql` (columnas admin-only en `project_briefs`, `client_visible` en RLS de `project_stages`, `contact_messages` acotado, elimina `project_stages.notes`), `0006_email_tenancy.sql` (índice único `lower(email)` + resync de tenancy), `0007_contact_rate_limit.sql` (rate limit 5/min/IP para `contact_messages` leído de `request.headers` → `x-forwarded-for`; `subject` pasa a `check (subject is null)`).
  - **Tenancy por email**: los proyectos se asocian al cliente por `lower(profiles.email) = projects.client_email` (el perfil recién existe tras su primer login). `profiles.email` tiene índice único case-insensitive y un trigger sobre `auth.users UPDATE` resincroniza `profiles.email` y `projects.client_email` cuando el usuario cambia de email.
- **Formulario de contacto**: Web3Forms (email al inbox) + copia en `contact_messages` visible en el panel admin (fallo silencioso no rompe la UX). Anti-abuse: honeypot + controles client-side + **rate limit en DB** (trigger `throttle_contact_messages`, 5/min por IP leída de `x-forwarded-for`; límite mitigatorio porque el header puede falsificarse) + `subject` forzado a null.

## Hosting & Deployment

- **Vercel / Netlify** — free hosting with automatic deploys from the Git repository.
- Variables de entorno requeridas: `DATABASE_URL`, `DATABASE_PUBLISHABLE_KEY` (ver `.env.example`).
- **Prefijos de env**: `envPrefix: ['FORM_', 'DATABASE_']` en `vite.config.ts` inlinea en el bundle del cliente toda variable con esos prefijos — son públicas por diseño (la protección real es RLS + honeypot). Nunca usar esos prefijos para secretos; un prefijo explícito `PUBLIC_*` reemplazará esta convención (follow-up).
- CSP `connect-src` en `vercel.json` / `netlify.toml` ya incluye `https://*.supabase.co wss://*.supabase.co`.

## Tooling

- **Node.js (LTS)** — runtime for build tooling.
- **npm** — package manager.
- **Git + GitHub** — version control and repository hosting.
- **ESLint + Prettier** — code quality and consistent formatting.
- **Vitest + React Testing Library** — unit testing with >80% coverage.
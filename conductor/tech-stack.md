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
  - **Migraciones** (`supabase/migrations/`, aplicar con SQL Editor o `supabase db push`): `0001_init.sql` (esquema base), `0002_drop_billing.sql` (elimina la tabla `payments` y las columnas `projects.amount/currency` por la estrategia fair-use), `0003_client_brief.sql` (tabla `project_briefs`), `0004_project_completion.sql` (`projects.completed_at` + trigger), `0005_security_hardening.sql` (columnas admin-only en `project_briefs`, `client_visible` en RLS de `project_stages`, `contact_messages` acotado, elimina `project_stages.notes`), `0006_email_tenancy.sql` (índice único `lower(email)` + resync de tenancy), `0007_contact_rate_limit.sql` (rate limit 5/min/IP para `contact_messages` leído de `request.headers` → `x-forwarded-for`; `subject` pasa a `check (subject is null)`), `0008_contact_rate_limit_strict.sql` (endurece el trigger `throttle_contact_messages` a **1 consulta/min/IP**, aplicada 2026-10-10), `0009_contact_insert_lockdown.sql` (revoca INSERT público de `contact_messages` a `anon`/`authenticated`; el único camino es la Edge Function con `service_role`), `0010_contact_rate_limit_hardened.sql` (**fail-closed** si no hay IP + límite global 120/min + lee `x-client-ip` propagada por la función), `0011_brief_status_derive.sql` (`status` de `project_briefs` derivado por `compute_brief_status()`).
  - **Tenancy por email**: los proyectos se asocian al cliente por `lower(profiles.email) = projects.client_email` (el perfil recién existe tras su primer login). `profiles.email` tiene índice único case-insensitive y un trigger sobre `auth.users UPDATE` resincroniza `profiles.email` y `projects.client_email` cuando el usuario cambia de email.
- **Formulario de contacto**: Supabase Edge Function `contact-notify` (Deno) + **Cloudflare Turnstile** + envío por **Resend API** desde `hola@gabrielmarrero.com.ar` (dominio verificado en Resend con DKIM + SPF; Zoho Mail sigue como receptor), + copia en `contact_messages` visible en el panel admin. Anti-abuse: **Turnstile (autoritativo)** + honeypot + controles client-side + **rate limit en DB** (trigger `throttle_contact_messages`: **1 consulta/min/IP** + **límite global 120/min** con `0010`, lee `x-client-ip` propagada por la Edge Function — fail-closed si no hay IP) + `subject` forzado a null. Web3Forms **retirado** (2026-10-10, track `own_email_notifications_20261009`).
  - **Secretos del formulario** (solo Edge Function Secrets de Supabase, nunca en el repo): `TURNSTILE_SECRET`, `MAIL_PROVIDER_API_KEY` (API key de Resend), opcionales `MAIL_FROM`/`MAIL_TO` (default `hola@gabrielmarrero.com.ar`). Lo único público en el cliente es `PUBLIC_TURNSTILE_SITE_KEY` (env, prefijo `PUBLIC_*`). Los `ZOHO_*` quedaron **inertes** y pueden borrarse del dashboard.

## Hosting & Deployment

- **Vercel / Netlify** — free hosting with automatic deploys from the Git repository.
- Variables de entorno requeridas: `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `PUBLIC_TURNSTILE_SITE_KEY` (opcional `PUBLIC_ARS_RATE`; ver `.env.example`).
- **Prefijo de env**: `envPrefix: ['PUBLIC_']` en `vite.config.ts` inlinea en el bundle del cliente SOLO las variables con ese prefijo — públicas por diseño (la protección real es RLS + Turnstile). Ningún secreto usa `PUBLIC_*`; los secretos (`TURNSTILE_SECRET`, `MAIL_PROVIDER_API_KEY`) viven solo en Edge Function Secrets (SEC-009, antes `DATABASE_*`/`ARS_*`/`TURNSTILE_*`).
- CSP en `vercel.json` / `netlify.toml`: `script-src`/`connect-src`/`frame-src` incluyen `https://challenges.cloudflare.com` (Turnstile) y `connect-src` está **acotado al ref exacto** de Supabase (`https://jntueibgkfwptigpncmh.supabase.co` + `...functions.supabase.co`, sin comodín `*.supabase.co` — SEC-008) + HSTS declarado (`max-age=63072000`, SEC-009). Test de regresión en `src/headersConfig.test.ts`.

## Tooling

- **Node.js (LTS)** — runtime for build tooling.
- **npm** — package manager.
- **Git + GitHub** — version control and repository hosting.
- **ESLint + Prettier** — code quality and consistent formatting.
- **Vitest + React Testing Library** — unit testing with >80% coverage.
- **Context7** — MCP de documentación viva para el agente (opencode). Plugin `@upstash/context7-opencode` en `opencode.json` (`plugin`); provee `context7_resolve-library-id` y `context7_query-docs` + skill `context7-mcp`. Uso: consultar docs actualizadas de las librerías del stack (React 19, Vite 8, Tailwind 4, Vitest 5, TS 6). **Setup**: tras tocar config hay que reiniciar opencode y autenticar (`opencode mcp auth context7`, OAuth) o definir `CONTEXT7_API_KEY`. *Track `agent_tooling_20261010`.*
- **Playwright CLI** — control de navegador real desde el agente (CLI + skill, no MCP: eficiente en tokens). DevDependency `@playwright/cli` (se invoca con `npx playwright-cli`); browsers en `C:\Users\<user>\AppData\Local\ms-playwright` (instalar con `npx playwright-cli install-browser chromium`). Skill en `.agents/skills/playwright-cli/` (instalada con `npx playwright-cli install --skills=agents`). Uso: `npx playwright-cli open <url>` → `snapshot` → `screenshot --filename ...` → `close`. Headless por defecto. **Windows**: el instalador detecta msedge/chrome instalado (config local `.playwright/cli.config.json`, gitignored); si hay fricción de antivirus, documentar workaround. Salida de sesión en `.playwright-cli/` (gitignored). *Track `agent_tooling_20261010`.*
- **SkillUI** — genera una skill de design system desde el propio repo (análisis estático, sin AI ni API keys). Instalado global (`npm i -g skillui`). Uso en este proyecto (solo `--dir`, nunca `--url` de terceros por ética/fair-use):
  `skillui --dir . --name portfolio-design --out .opencode/skills`
  El output se **cura manualmente** contra los tokens reales de `src/index.css` (`@theme`): Tailwind v4 con variables CSS puede generar falsos positivos de paleta/fuentes. La skill versionada es `.opencode/skills/portfolio-design/` (SKILL.md + DESIGN.md + references/DESIGN.md; el zip `.skill` y `screens/` están gitignored). Re-generar mantiene el nombre `portfolio-design` y el curado de tokens. *Track `agent_tooling_20261010`.*
# Tech Stack: Junior Fullstack Developer Portfolio

## Frontend

- **React 19** (SPA) — component-based UI for the portfolio (Vite scaffold, installed 19.2.8).
- **Vite** — fast development server and build tooling.
- **TypeScript** — type-safe code that showcases modern frontend practices. (Recommended)
- **React Router** — routing for `/login`, `/admin/*` (panel de gestión) y `/panel/*` (panel del cliente).

## Styling

- **Tailwind CSS** — utility-first CSS for a consistent dark, modern UI with rapid iteration.

## Backend

- **Supabase** — Backend-as-a-Service con Postgres + Auth + Storage + RLS.
  - **Auth**: magic link para clientes; email+password (o magic link) para el admin.
  - **Base de datos**: `profiles`, `projects`, `project_stages`, `payments`, `milestone_approvals`, `contact_messages`.
  - **RLS (Row Level Security)**: el cliente solo ve sus proyectos/etapas/pagos/decisiones; solo el admin escribe.
  - **Migraciones**: `supabase/migrations/0001_init.sql` (aplicar en el SQL Editor del dashboard o con `supabase db push`).
  - Los proyectos se asocian al cliente por `client_email` (el perfil recién existe tras su primer login).
- **Formulario de contacto**: Web3Forms (email al inbox) + copia en `contact_messages` visible en el panel admin (fallo silencioso no rompe la UX).

## Hosting & Deployment

- **Vercel / Netlify** — free hosting with automatic deploys from the Git repository.
- Variables de entorno requeridas: `DATABASE_URL`, `DATABASE_PUBLISHABLE_KEY` (ver `.env.example`).
- CSP `connect-src` en `vercel.json` / `netlify.toml` ya incluye `https://*.supabase.co wss://*.supabase.co`.

## Tooling

- **Node.js (LTS)** — runtime for build tooling.
- **npm** — package manager.
- **Git + GitHub** — version control and repository hosting.
- **ESLint + Prettier** — code quality and consistent formatting.
- **Vitest + React Testing Library** — unit testing with >80% coverage.
# Spec — Documentar README del proyecto

> **Track ID:** `readme_docs_20261011`
> **Fuente:** Gap 1 del reporte de aptitud MVP/v1 (análisis 2026-10-11).
> **Estado:** 🔜 Pendiente (spec + plan aprobados).

---

## 1. Contexto y objetivo

El `README.md` es todavía el template por defecto de Vite ("React + TypeScript + Vite" + cómo habilitar React Compiler). Para un sitio en producción (https://gabrielmarrero.com.ar) con panel admin, portal de clientes, Supabase y un formulario con Edge Function, ese README no sirve: no explica qué es el proyecto ni cómo levantarlo.

**Objetivo:** que una persona nueva (recruiter, colaborador o el propio dueño en 6 meses) pueda entender el producto y correr el proyecto en <10 minutos usando solo el README + `.env.example`.

## 2. Functional Requirements

- **FR1 — README con identidad:** título + descripción de una línea del producto (sitio de servicios web para PyMEs + sistema de gestión para clientes), con link al sitio en producción y al repo.
- **FR2 — Stack:** lista breve del stack real (React 19, TypeScript, Vite 8, Tailwind CSS 4, React Router 7, Supabase, Vitest, Cloudflare Turnstile, Edge Function en Deno, Resend).
- **FR3 — Setup local:** pasos (npm install, copiar `.env.example` a `.env.local`, valores de Supabase + Turnstile; aplicar migraciones `supabase/migrations/`; deploy de la Edge Function `contact-notify` con sus secrets `TURNSTILE_SECRET`/`MAIL_PROVIDER_API_KEY`). Enlazar al CHECKLIST-OWNER del track `own_email_notifications_20261009` para la parte del email.
- **FR4 — Scripts:** tabla de los scripts de `package.json` (dev, build, lint, format, typecheck, preview, test, test:watch, coverage).
- **FR5 — Superficies del sistema:** tabla con las rutas públicas y privadas (`/`, `/login`, `/acceso-admin`, `/admin/*`, `/panel/*`).
- **FR6 — Deploy:** Vercel/Netlify (SPA rewrite + headers de seguridad ya en `vercel.json`/`netlify.toml`), variables de deploy.
- **FR7 — Enlaces a conductor/:** enlazar `conductor/product.md`, `conductor/tech-stack.md` y `.env.example` como docs de referencia (sin duplicar contenido).

## 3. Non-Functional Requirements

- **NFR1 —** No tocar código de la app; solo `README.md`.
- **NFR2 —** Idioma: español, consistente con el repo y `conductor/`.
- **NFR3 —** No duplicar secciones largas que ya viven en `conductor/` o `.env.example` (enlazar).

## 4. Acceptance Criteria

- [ ] El README ya no menciona "React + TypeScript + Vite" como template ni React Compiler.
- [ ] Una persona nueva puede crear `.env.local` y levantar `npm run dev` siguiendo solo el README.
- [ ] El README enlaza a `conductor/product.md`, `conductor/tech-stack.md` y `.env.example`.
- [ ] Queda documentado que `/acceso-admin` y `/admin/*` son superficies internas (no publicadas).
- [ ] `npm run lint` / `npm run typecheck` siguen verdes (sin cambios de código, no aplica build).

## 5. Out of Scope

- Sincronizar `product.md`/`product-guidelines.md` (→ track `docs_sync_20261011`).
- Cambios de código, config o infraestructura.
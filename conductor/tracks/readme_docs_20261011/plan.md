# Plan: Documentar README del proyecto

> **Track ID:** `readme_docs_20261011`
> **Spec:** [./spec.md](./spec.md)
> **Status:** 🔜 Pendiente
> **Reglas:** docs-only; verificación final con link checking manual.

---

## Fase T0 — Reescritura del README

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T0.1 | Reemplazar contenido del template: identidad, stack, enlaces a producción/repo | `README.md` | ☑️ |
| T0.2 | Sección setup local (env, migraciones, Edge Function, Turnstile) + enlace CHECKLIST-OWNER | `README.md` | ☑️ |
| T0.3 | Scripts, superficies del sistema y deploy (Vercel/Netlify) | `README.md` | ☑️ |
| T0.4 | Enlaces a `conductor/product.md`, `conductor/tech-stack.md`, `.env.example` | `README.md` | ☑️ |

## Fase V — Verificación final

| # | Tarea | Herramienta | Estado |
|---|-------|-------------|--------|
| V.1 | Verificar que todos los enlaces internos apuntan a archivos existentes | lectura manual | ☑️ |
| V.2 | Levantar `npm run dev` y confirmar instrucciones sin pasos faltantes | Vite | ☑️ |
| V.3 | Commit `docs(readme): documentar producto, setup, superficies y deploy` + docs del track | git | ☑️ |

---

## Riesgos

| Riesgo | Mitigación |
|--------|-----------|
| README desincronizado con la realidad a futuro | Secciones breves que enlazan a `conductor/` (fuente única) |
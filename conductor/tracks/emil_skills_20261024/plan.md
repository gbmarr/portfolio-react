# Plan — Skills de Emil Kowalski

> **Track ID:** `emil_skills_20261024`
> **Spec:** [./spec.md](./spec.md)
> **Estado:** Implementado.

---

## Fase T0 — Instalación

| # | Tarea | Herramienta | Estado |
|---|-------|-------------|--------|
| T0.1 | Instalar subset curado en `.agents/skills` | `npx skills add emilkowalski/skills --skill ... --agent opencode` | Hecho |
| T0.2 | Verificar que `skills-lock.json` registre source/hash | revisión manual | Hecho |
| T0.3 | Verificar que no se haya tocado `portfolio-design` | `git status` / diff | Hecho |

## Fase T1 — Documentación

| # | Tarea | Archivo | Estado |
|---|-------|---------|--------|
| T1.1 | Documentar skills y precedencia | `conductor/tech-stack.md` | Hecho |
| T1.2 | Registrar el track | `conductor/tracks.md` | Hecho |

## Fase V — Verificación

| # | Tarea | Herramienta | Estado |
|---|-------|-------------|--------|
| V.1 | `npm run test` | Vitest | Hecho |
| V.2 | `npm run typecheck` / `npm run lint` | tsc / ESLint | Hecho |
| V.3 | `npm run build` | Vite | Hecho |

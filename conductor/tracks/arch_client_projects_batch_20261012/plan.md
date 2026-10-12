# Plan — Batch de etapas para el listado del cliente

> **Track ID:** `arch_client_projects_batch_20261012`
> **Spec:** [./spec.md](./spec.md)
> **Status:** ⏳ Pendiente
> **Reglas:** una sola consulta; mismo resultado visible; el cálculo de progreso no cambia.

---

## Fase T0 — Función batch en la capa de datos

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T0.1 | `listStagesForProjects(ids)` (consulta `in`, agrupada por `project_id`) | `src/lib/projects.ts` | ⬜ |
| T0.2 | Test del interface: ids vacíos / un proyecto / varios | `src/lib/projects.test.ts` | ⬜ |

## Fase T1 — Migrar la página

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T1.1 | Reemplazar el `Promise.all(projects.map(listStages))` por el batch | `src/pages/client/ClientProjectsPage.tsx` | ⬜ |
| T1.2 | Mantener `computeProgress` sobre las etapas agrupadas | `src/pages/client/ClientProjectsPage.tsx` | ⬜ |

## Fase V — Verificación

| # | Tarea | Herramienta | Estado |
|---|-------|----------|--------|
| V.1 | `npm run test` (suite verde, cobertura ≥80 %) | Vitest | ⬜ |
| V.2 | `npm run typecheck` / `npm run lint` | tsc / ESLint | ⬜ |
| V.3 | Grep: sin `listStages` dentro de `map` en páginas | repo | ⬜ |
| V.4 | Smoke manual: portal cliente con 0 / 1 / varios proyectos (progreso correcto) | manual | ⬜ |
| V.5 | Commit `perf(arch): batch de etapas en el listado del cliente (N+1)` + docs del track | git | ⬜ |

---

## Riesgos

| Riesgo | Mitigación |
|--------|-----------|
| Lista de ids vacía genera un `in()` inválido | Guarda temprana: sin ids, devolver `{}` (cubierto por test) |
| Cambio en el orden de etapas por proyecto | Agrupar preservando `order` como hoy |

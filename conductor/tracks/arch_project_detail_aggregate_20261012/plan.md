# Plan — Agregado de detalle de proyecto (`loadProjectDetail`)

> **Track ID:** `arch_project_detail_aggregate_20261012`
> **Spec:** [./spec.md](./spec.md)
> **Status:** ✅ Implementado — pendiente smoke manual (V.4)
> **Reglas:** sin cambio de comportamiento observable; el agregado se testea en el interface de la capa de datos.

---

## Fase T0 — Agregado en la capa de datos

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T0.1 | Tipo `ProjectDetail` + `loadProjectDetail(id)` (Promise.all interno) | `src/lib/projects.ts` | ✅ |
| T0.2 | Error de "no encontrado" tipado; `getProject` deja de exponer un string para ramificar | `src/lib/projects.ts` | ✅ |
| T0.3 | Test del agregado en el interface (Supabase mockeado): encontrado y no encontrado | `src/lib/projects.test.ts` | ✅ |

## Fase T1 — Migrar páginas

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T1.1 | Consumir `loadProjectDetail` + `ProjectDetail`; borrar `Detail` y `load` local | `src/pages/admin/ProjectDetailPage.tsx` | ✅ |
| T1.2 | Consumir `loadProjectDetail`; ramificar "no encontrado" por tipo (no por string) | `src/pages/client/ClientProjectDetailPage.tsx` | ✅ |

## Fase V — Verificación

| # | Tarea | Herramienta | Estado |
|---|-------|-------------|--------|
| V.1 | `npm run test` (suite verde, cobertura ≥80 %) | Vitest | ✅ |
| V.2 | `npm run typecheck` / `npm run lint` | tsc / ESLint | ✅ |
| V.3 | Grep: sin `'Proyecto no encontrado'` en páginas; sin `Detail` local | repo | ✅ |
| V.4 | Smoke manual: detalle admin + detalle cliente (encontrado y 404) | Playwright CLI / manual | ⬜ |
| V.5 | Commit `refactor(arch): agregado loadProjectDetail en la capa de datos` + docs del track | git | ✅ |

---

## Riesgos

| Riesgo | Mitigación |
|--------|-----------|
| El error tipado cambia el texto visible de "no encontrado" | Conservar el mensaje actual (`panelCopy.client.notFound`) en la rama por tipo |
| Dependencia con C1 (hook) si se migran las páginas en paralelo | C2 no depende de C1; el `load` puede seguir como está hasta migrar |

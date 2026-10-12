# Plan — Profundizar los loaders async (`useAsyncData` + `Loading`/`ErrorAlert`)

> **Track ID:** `arch_async_data_hook_20261012`
> **Spec:** [./spec.md](./spec.md)
> **Status:** ✅ Implementado — pendiente smoke manual (V.3)
> **Reglas:** sin cambio de comportamiento observable; el interface es la superficie de test.

---

## Fase T0 — Módulos nuevos

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T0.1 | `useAsyncData(loader, deps)` con cancelación, error mapeado y `reload` | `src/hooks/useAsyncData.ts` (nuevo) | ✅ |
| T0.2 | Test del hook a través de su interfaz (resolución, rechazo, desmontaje, `reload`) | `src/hooks/useAsyncData.test.tsx` (nuevo) | ✅ |
| T0.3 | `<Loading />` compartido (`role="status"`, `animate-pulse`) | `src/components/ui/Loading.tsx` (nuevo) | ✅ |
| T0.4 | `<ErrorAlert />` compartido (`role="alert"`, estilo red-400/40) | `src/components/ui/ErrorAlert.tsx` (nuevo) | ✅ |

## Fase T1 — Migrar páginas

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T1.1 | Migrar dashboard admin (KPIs + stats de briefs) | `src/pages/admin/AdminDashboard.tsx` | ✅ |
| T1.2 | Migrar listados admin | `ProjectsListPage.tsx`, `ClientsPage.tsx`, `MessagesPage.tsx` | ✅ |
| T1.3 | Migrar detalle/edición admin (con `reload` tras acciones) | `ProjectDetailPage.tsx`, `ProjectFormPage.tsx` | ✅ |
| T1.4 | Migrar páginas del cliente | `ClientProjectsPage.tsx`, `ClientProjectDetailPage.tsx` | ✅ |

## Fase T2 — Limpieza

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T2.1 | Eliminar uniones `State`/`LoadState` locales y bloques JSX duplicados | páginas migradas | ✅ |
| T2.2 | Grep: sin duplicados de `role="status"`/`role="alert"` en páginas | repo | ✅ |

## Fase V — Verificación

| # | Tarea | Herramienta | Estado |
|---|-------|-------------|--------|
| V.1 | `npm run test` (suite verde, cobertura ≥80 %) | Vitest | ✅ |
| V.2 | `npm run typecheck` / `npm run lint` | tsc / ESLint | ✅ |
| V.3 | Smoke manual: dashboard, listados, detalle, panel cliente | Playwright CLI / manual | ⬜ |
| V.4 | Commit `refactor(arch): unificar loaders async con useAsyncData` + docs del track | git | ✅ |

---

## Riesgos

| Riesgo | Mitigación |
|--------|-----------|
| Cambio sutil de semántica loading/error | Tests existentes por página + smoke manual (V.3) |
| `reload` con deps inestables (bucles) | deps explícitas por página; test del hook con deps |

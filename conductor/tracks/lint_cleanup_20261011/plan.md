# Plan: Eliminar warnings de react-refresh/only-export-components

> **Track ID:** `lint_cleanup_20261011`
> **Spec:** [./spec.md](./spec.md)
> **Status:** 🔜 Pendiente
> **Reglas:** refactor mecánico con tests verdes en cada fase; grep de consumidores antes de mover exports.

---

## Fase T0 — Auditar consumidores

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T0.1 | Grep de `useAuth`, `AuthProvider` y demás exports de `src/lib/auth.tsx` en el repo | `src/**` | ⬜ |
| T0.2 | Grep de los exports no-componente de `ClientProjectsPage.tsx` | `src/**` | ⬜ |

## Fase T1 — Refactor de `src/lib/auth.tsx`

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T1.1 | Crear módulo del hook/helpers no-componentes e importarlos desde el provider | `src/lib/auth.tsx` + nuevo archivo | ⬜ |
| T1.2 | Actualizar imports de los consumidores (guard, pages, tests) | `src/routes/guards.tsx`, `src/pages/**` | ⬜ |
| T1.3 | Correr tests de auth y del router | `src/lib/auth.test.tsx`, `src/routes/AppRouter.test.tsx` | ⬜ |

## Fase T2 — Refactor de `ClientProjectsPage.tsx`

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T2.1 | Mover la constante/función no-componente al módulo de data/lib correspondiente | `src/pages/client/ClientProjectsPage.tsx` + destino | ⬜ |
| T2.2 | Actualizar imports y tests de la página | `src/pages/client/ClientProjectsPage.test.tsx` | ⬜ |

## Fase V — Verificación final

| # | Tarea | Herramienta | Estado |
|---|-------|-------------|--------|
| V.1 | `npm run lint` (0 warnings) | ESLint | ⬜ |
| V.2 | `npm run typecheck` / `npm run test` / `npm run coverage` (≥80%) | Vitest | ⬜ |
| V.3 | Commit `refactor(lint): separar exports no-componentes, 0 warnings` + docs del track | git | ⬜ |

---

## Riesgos

| Riesgo | Mitigación |
|--------|-----------|
| Cambiar la ruta de import rompe módulos no cubiertos por tests | Grep exhaustivo + typecheck como red de seguridad |
| El helper de ClientProjectsPage es usado por otra página | Se mueve a `src/lib/` o `src/data/` con import actualizado en todos |
| Regresión de fast-refresh en dev | La separación es exactamente lo que la regla pide |
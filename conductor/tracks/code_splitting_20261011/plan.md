# Plan: Code-splitting de paneles admin/cliente

> **Track ID:** `code_splitting_20261011`
> **Spec:** [./spec.md](./spec.md)
> **Status:** 🔜 Pendiente
> **Reglas:** TDD donde aplique; build verde en cada fase; commits convencionales.

---

## Fase T0 — Lazy de páginas admin

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T0.1 | Convertir los 6 imports de páginas admin a `React.lazy` | `src/routes/AppRouter.tsx` | ⬜ |
| T0.2 | Agregar `RouteFallback` (spinner accesible) y envolver rutas lazy en `Suspense` | `src/routes/AppRouter.tsx` (o componente nuevo) | ⬜ |
| T0.3 | Tests del router tras el cambio (rutas, guards, fallback) | `src/routes/AppRouter.test.tsx` | ⬜ |

## Fase T1 — Lazy de páginas cliente

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T1.1 | Convertir los 2 imports de páginas cliente a `React.lazy` y asegurar `Suspense` | `src/routes/AppRouter.tsx` | ⬜ |
| T1.2 | Tests de `/panel` y `/panel/:id` con el nuevo loader | `src/routes/AppRouter.test.tsx` | ⬜ |

## Fase V — Verificación final

| # | Tarea | Herramienta | Estado |
|---|-------|-------------|--------|
| V.1 | Build: confirmar chunks separados y bundle principal < 500 kB | `npm run build` | ⬜ |
| V.2 | `npm run typecheck` / `npm run lint` | — | ⬜ |
| V.3 | `npm run test` y `npm run coverage` (≥80%) | Vitest | ⬜ |
| V.4 | Commit `refactor(routes): code-splitting lazy de paneles admin/cliente` + docs del track | git | ⬜ |

> **Post-track:** si el chunk principal sigue >500 kB aún con el lazy, evaluar división de vendor en track separado (out of scope).

---

## Riesgos

| Riesgo | Mitigación |
|--------|-----------|
| Fallback de Suspense rompe tests existentes (act/await) | Ajustar tests con `findBy*` para esperar el chunk lazy |
| Guards/envuelven rutas lazy y el navegador parpadea | Fallback ligero compartido; layouts quedan estáticos |
| Chunk principal sigue >500 kB | Se evalúa vendor splitting en track aparte (out of scope aquí) |
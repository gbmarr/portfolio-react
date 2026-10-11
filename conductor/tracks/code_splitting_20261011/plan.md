# Plan: Code-splitting de paneles admin/cliente

> **Track ID:** `code_splitting_20261011`
> **Spec:** [./spec.md](./spec.md)
> **Status:** ✅ Completado (2026-10-11)
> **Reglas:** TDD donde aplique; build verde en cada fase; commits convencionales.

---

## Fase T0 — Lazy de páginas admin

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T0.1 | Convertir los 6 imports de páginas admin a `React.lazy` | `src/routes/AppRouter.tsx` | ☑️ |
| T0.2 | Agregar `RouteFallback` (spinner accesible) y envolver rutas lazy en `Suspense` | `src/routes/AppRouter.tsx` | ☑️ |
| T0.3 | Tests del router tras el cambio (rutas, guards, fallback) | `src/routes/AppRouter.test.tsx` | ☑️ |

## Fase T1 — Lazy de páginas cliente

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T1.1 | Convertir los 2 imports de páginas cliente a `React.lazy` y asegurar `Suspense` | `src/routes/AppRouter.tsx` | ☑️ |
| T1.2 | Tests de `/panel` y `/panel/:id` con el nuevo loader | `src/routes/AppRouter.test.tsx` | ☑️ |

## Fase V — Verificación final

| # | Tarea | Herramienta | Estado |
|---|-------|-------------|--------|
| V.1 | Build: confirmar chunks separados y bundle principal reducido | `npm run build` | ☑️ |
| V.2 | `npm run typecheck` / `npm run lint` | — | ☑️ |
| V.3 | `npm run test` y `npm run coverage` (≥80%) | Vitest | ☑️ |
| V.4 | Commit `refactor(routes): code-splitting lazy de paneles admin/cliente` + docs del track | git | ☑️ |

## Resultado (verificado 2026-10-11)

- **Chunks separados:** 8 chunks lazy (AdminDashboard 2.80 kB, ProjectsListPage 2.77 kB,
  ProjectFormPage 5.47 kB, ProjectDetailPage 15.20 kB, ClientsPage 3.45 kB, MessagesPage 3.66 kB,
  ClientProjectsPage 2.47 kB, ClientProjectDetailPage 13.19 kB) + chunks compartidos de UI/data.
- **Bundle público:** `dist/assets/index-*.js` **574.28 kB → 518.08 kB** (162.40 → 150.48 gzip).
  **Sigue >500 kB** → se documenta en metadata (D2) y se evaluará vendor splitting post-track.
- **Tests:** 437/437 (se agregaron 5 router + 1 fallback). **Coverage:** 92.87% st / 86.8% br /
  91.19% fn / 94.7% li (≥80%). **typecheck** OK. **lint** 0/0.
- Fix incidental: 3 errores pre-existentes de `no-unused-vars` en `src/components/Turnstile.test.tsx`
  (params tipados sin uso) resueltos con `void` — sin `eslint-disable`.

> **Post-track:** el chunk principal sigue >500 kB (~518 kB): evaluar división de vendor
> (react/react-dom/router/supabase) en track separado (out of scope).

---

## Riesgos

| Riesgo | Mitigación |
|--------|-----------|
| Fallback de Suspense rompe tests existentes (act/await) | Ajustar tests con `findBy*` para esperar el chunk lazy ✅ |
| Guards/envuelven rutas lazy y el navegador parpadea | Fallback ligero compartido; layouts quedan estáticos ✅ |
| Chunk principal sigue >500 kB | Se evalúa vendor splitting en track aparte (out of scope aquí) ✅ documentado |
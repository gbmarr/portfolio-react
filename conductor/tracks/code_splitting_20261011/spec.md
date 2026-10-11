# Spec — Code-splitting de paneles admin/cliente

> **Track ID:** `code_splitting_20261011`
> **Fuente:** Gap 2 del reporte de aptitud MVP/v1 (análisis 2026-10-11).
> **Estado:** 🔜 Pendiente (spec + plan aprobados; decisión de alcance confirmada con el usuario).

---

## 1. Contexto y objetivo

El build actual emite un único JS de **574.28 kB (162.40 kB gzip)** y Vite advierte `Some chunks are larger than 500 kB`. Como el router (`src/routes/AppRouter.tsx`) importa estáticamente todas las páginas admin y de cliente, buscadores y visitantes del sitio público descargan todo el sistema de gestión.

**Objetivo:** dividir la app con `React.lazy` + `Suspense` para los dos grupos de rutas privadas (`/admin/*` y `/panel/*`), dejando ruteo público (home + `/login` + `/acceso-admin`) liviano. Sin cambio de comportamiento ni de rutas.

## 2. Functional Requirements

- **FR1 — Lazy de páginas admin:** las 6 páginas bajo `RequireAdmin` (`AdminDashboard`, `ProjectsListPage`, `ProjectFormPage`, `ProjectDetailPage`, `ClientsPage`, `MessagesPage`) se importan con `React.lazy(() => import('...'))`.
- **FR2 — Lazy de páginas cliente:** `ClientProjectsPage` y `ClientProjectDetailPage` también lazy.
- **FR3 — Fallback de suspensión:** un componente `RouteFallback` mínimo (spinner con aria-label, sin fuga de diseño) envuelve las rutas lazy dentro de `Suspense`.
- **FR4 — Layouts y guards intactos:** `AdminLayout`, `ClientLayout`, `RequireAdmin/RequireAuth/RequireClient`, `AuthProvider` y `RobotsMeta` se mantienen con import estático (no lazy): son contexto compartido y liviano.
- **FR5 — Sin cambio de comportamiento:** las rutas, guards y `noindex` actuales siguen igual.

## 3. Non-Functional Requirements

- **NFR1 —** Cobertura >80% (workflow.md); los tests existentes de `AppRouter.test.tsx`/guards deben seguir verdes.
- **NFR2 —** Build verde y chunk principal del sitio público < 500 kB (objetivo: reducir el JS que se descarga en `/`).
- **NFR3 —** TDD: si se agrega un test del fallback, primero en rojo.
- **NFR4 —** Sin migraciones de DB; sin cambios de fair-use.

## 4. Acceptance Criteria

- [ ] El build emite chunks separados para admin y cliente (`dist/assets/` con al menos 3 bundles JS) y el bundle principal ya no incluye las páginas de gestión.
- [ ] Navegar a `/` no descarga los chunks de gestión; navegar a `/admin` o `/panel` los carga bajo demanda.
- [ ] Fallback de Suspense visible y accesible durante la carga; sin pantalla en blanco.
- [ ] `npm run typecheck`, `npm run lint`, `npm run test` (416) y `npm run coverage` (≥80%) verdes.

## 5. Out of Scope

- División manual de chunks vendor / librerías de terceros (re-evaluar post-track si el chunk principal sigue >500 kB).
- Cambios de rutas, guards o `vercel.json`/`netlify.toml`.
- Optimizaciones de imágenes o fuentes.
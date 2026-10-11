# Spec — Eliminar warnings de react-refresh/only-export-components

> **Track ID:** `lint_cleanup_20261011`
> **Fuente:** Gap 5 del reporte de aptitud MVP/v1 (análisis 2026-10-11).
> **Estado:** 🔜 Pendiente (spec + plan aprobados).

---

## 1. Contexto y objetivo

`npm run lint` reporta **2 warnings** (0 errores): `react-refresh/only-export-components` en:

1. `src/lib/auth.tsx:143` — el archivo exporta el provider (`AuthProvider`) y también funciones/constantes no-componentes (p. ej. `useAuth`, helpers).
2. `src/pages/client/ClientProjectsPage.tsx:17` — exporta el componente de página y además una constante/función.

No rompen el build, pero degradan el fast-refresh de Vite en esos archivos y ensucian el lint para futuros PRs.

**Objetivo:** eliminar ambos warnings reubicando los exports no-componentes a módulos dedicados, sin cambiar comportamiento ni romper imports.

## 2. Functional Requirements

- **FR1 — auth.tsx:** separar en dos módulos:
  - `src/lib/auth-context.tsx` (o mantener nombre `auth.tsx`) con el `AuthProvider` y el estado.
  - Hook `useAuth` (y cualquier otra exportación no-componente, como `SessionUser`, tipos o helpers) en su propio archivo importable desde el provider.
  - Actualizar todos los imports del repo (grep de `useAuth`/`AuthProvider`).
- **FR2 — ClientProjectsPage.tsx:** mover la constante/función no-componente (p. ej. un mapping de copy o un loader) a `src/pages/client/` o `src/lib/`, y que la página lo importe.
- **FR3 — Sin `eslint-disable`:** la regla se mantiene activa; el warning debe desaparecer por estructura, no por supresión.
- **FR4 — Los tests existentes de auth (`src/lib/auth.test.tsx`) y de la página siguen pasando sin cambios de comportamiento.**

## 3. Non-Functional Requirements

- **NFR1 —** Cobertura >80%; no bajar la cobertura existente.
- **NFR2 —** Build, typecheck, lint (0 warnings) verdes.
- **NFR3 —** Sin cambios de DB, rutas ni UI.

## 4. Acceptance Criteria

- [ ] `npm run lint` termina con **0 errores y 0 warnings**.
- [ ] `useAuth`/`AuthProvider` y la constante de `ClientProjectsPage` siguen disponibles con los mismos nombres (o todos los consumidores actualizados).
- [ ] `npm run typecheck` / `npm run test` (416) / `npm run coverage` (≥80%) verdes.

## 5. Out of Scope

- Cambiar la config de ESLint (regla sigue activa).
- Refactors de fast-refresh en otros archivos sin warnings.
- El `format:check` global rojo (preexistente, fuera de alcance).
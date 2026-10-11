# Plan: Coherencia de checks del estimador (matriz tier↔extra)

> **Track ID:** `estimator_tier_extras_20261010`
> **Spec:** [./spec.md](./spec.md)
> **Status:** ✅ **Completado** (2026-10-10). Implementación verificada: `npm run typecheck` ✅, `npm run lint` ✅ (solo 2 warnings preexistentes ajenos), `npm run test` ✅ 67 files / 416 tests, `npm run coverage` ✅ 92.71% stmts (umbral 80%).
> **Reglas:** TDD en lógica pura y en interacciones; build verde en cada fase; commits convencionales.

---

## Contexto

Análisis de las combinaciones de checks del estimador → contradicciones (landing con tienda, arbitraje institucional+tienda vs. medida, brief medida forzado a e-commerce, divergencia admin/público, copy "Hasta 5 secciones"). Solución: matriz de compatibilidad tier↔extra como fuente única de verdad + reconciliación de señales derivadas. Fases T0–T5 ya ejecutadas; este plan documenta el trabajo realizado y su verificación.

---

## Fase T0 — Modelo de compatibilidad en `src/data/estimate.ts` (TDD)

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T0.1 | Reescribir tipos de extras con `tiers`/`includedFor` + helpers `getSelectableExtras`/`getIncludedExtras`/`getVisibleExtras`/`isExtraAllowed` | `src/data/estimate.ts` | ✅ |
| T0.2 | Tests de la matriz: tienda/blog fuera de landing; blog solo institucional/medida; tienda incluida solo en medida | `src/data/estimate.test.ts` (nuevo) | ✅ |

## Fase T1 — Cálculo defensivo

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T1.1 | `computeEstimate`: filtrar extras con `isExtraAllowed`; `timeline` con `validExtras.length` | `src/lib/estimate.ts` | ✅ |
| T1.2 | `buildEstimateWhatsAppMessage`: clamp de sections (3–8) y filtro de extras | `src/lib/estimate.ts` | ✅ |
| T1.3 | Tests: tienda ignorada en landing (250/300), tienda no cobrada en medida (1200/1440), ids inválidos no alargan plazo, WhatsApp sin tienda en landing y clamp 99→8 | `src/lib/estimate.test.ts` | ✅ |

## Fase T2 — UI pública `Estimator.tsx`

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T2.1 | Renderizar `getVisibleExtras(tier)`; extra incluido deshabilitado + "Incluido en este plan" | `src/sections/Estimator.tsx` | ✅ |
| T2.2 | `handleTierChange(nextTier)`: podar `selectedExtras` incompatibles | `src/sections/Estimator.tsx` | ✅ |
| T2.3 | Tests: tienda oculta en landing / visible+disabled+checked en medida; poda institucional(+blog 760) → landing (250) | `src/sections/Estimator.test.tsx` | ✅ |

## Fase T3 — Admin `ProjectFormPage.tsx`

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T3.1 | Helper `withIncludedExtras(serviceType, extraIds)` + `handleServiceChange` (poda + incluidos) + normalización al cargar | `src/pages/admin/ProjectFormPage.tsx` | ✅ |
| T3.2 | Render con `getVisibleExtras(form.service_type)`; tienda deshabilitada "— incluido" | `src/pages/admin/ProjectFormPage.tsx` | ✅ |
| T3.3 | Tests: landing sin blog/tienda y con SEO; medida auto-incluye tienda (enviada deshabilitada); envío espera `['ecommerce','blog']` | `src/pages/admin/ProjectFormPage.test.tsx` | ✅ |

## Fase T4 — Brief/etapas

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T4.1 | Sacar catálogo y cobro de `medidaSections` (quedan en la sección del extra `ecommerce`) | `src/data/briefTemplates.ts` | ✅ |

> `src/data/stageTemplates.ts` NO se tocó: su test pasa todos los ids a `landing` y espera base+7; sin impacto por esta matriz.

## Fase T5 — Reconciliación de copy

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T5.1 | "Hasta 5 secciones" → "3 secciones base (hasta 8 con secciones extra)" | `src/data/services.ts` | ✅ |
| T5.2 | Ídem en la documentación (línea 84) | `conductor/servicios.md` | ✅ |

## Fase V — Verificación final

| # | Tarea | Herramienta | Estado |
|---|-------|-------------|--------|
| V.1 | `npm run typecheck` | — | ✅ |
| V.2 | `npm run lint` (2 warnings preexistentes ajenos: react-refresh en `src/lib/auth.tsx` y `src/pages/client/ClientProjectsPage.tsx`) | — | ✅ |
| V.3 | `npm run test` (67 files / 416 tests) | Vitest | ✅ |
| V.4 | `npm run coverage` (92.71% stmts / 85.84% branches / 92.56% funcs / 94.51% lines) | Vitest | ✅ |
| V.5 | `npm run format:check` — falla en todo el repo (223 archivos, preexistente, no introducido por este track); NO correr format masivo | — | ⬜ (no aplica a este track) |
| V.6 | Commit `feat(estimator): tier-extras compatibility matrix` + docs del track (`conductor/tracks/estimator_tier_extras_20261010/`, `conductor/tracks.md`) | git | ✅ |

---

## Verificación por fase (protocolo `workflow.md`)

Las fases se ejecutaron de corrido con suite/cobertura verdes al cierre y se reportaron al usuario antes del commit final. No quedan fases pendientes que requieran verificación manual del dueño (todo es client-side, sin deploy).

## Riesgos

| Riesgo | Mitigación |
|--------|-----------|
| Brief `medida` sin `ecommerce` al abrir el form | Normalización con `withIncludedExtras`; al guardar, upsert reinicia answers (documentado, migración única) |
| Índice de Docs divergente | La matriz es la única fuente; futuros extras declaran `tiers`/`includedFor` |
| `format:check` rojo global | Preexistente en todo el repo; fuera del alcance del track |
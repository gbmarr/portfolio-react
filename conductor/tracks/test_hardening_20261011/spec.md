# Spec — Endurecer tests: cobertura de Turnstile y velocidad de la suite

> **Track ID:** `test_hardening_20261011`
> **Fuente:** Gap 6 del reporte de aptitud MVP/v1 (análisis 2026-10-11).
> **Estado:** 🔜 Pendiente (spec + plan aprobados; enfoque confirmado con el usuario).

---

## 1. Contexto y objetivo

El reporte de cobertura muestra `Turnstile.tsx` con **68.29% lines / 38.46% functions / 50% branches** — por debajo del espíritu del umbral global (≥80%). Además la suite tarda **~98s** porque Vitest crea una instancia jsdom por archivo (`67 times`), y en la salida el propio runner sugiere `pool: 'vmThreads'` o `isolate: false`.

**Objetivo**: (a) subir la cobertura de `Turnstile.tsx` a ≥80% en branches, y (b) acelerar la suite configurando el pool de Vitest, manteniendo tests deterministas y sin romper aislamiento.

## 2. Functional Requirements

- **FR1 — Tests de Turnstile:** agregar `src/components/Turnstile.test.tsx` (crear si no existe) cubriendo:
  - renderización con `siteKey` presente → se monta e inicializa el widget (mock de `window.turnstile`).
  - callbacks `success`, `expired` y `error` invocan los handlers del componente (si aplica).
  - ausencia de `window.turnstile` o de `siteKey` → comportamiento degradado esperado sin crash.
  - branch coverage objetivo: **≥80% branches** en `Turnstile.tsx`.
- **FR2 — Pool/vitest config:** aplicar `pool: 'vmThreads'` (o la alternativa recomendada por la doc de Vitest 5) en `vite.config.ts` `test` — verificando previamente en Context7/doc oficial que el nombre de opción y el aislamiento son correctos en Vitest 5.
- **FR3 — Regresión de aislamiento:** `npm run test` completo debe quedar verde con la nueva config; si algún test depende de aislamiento por archivo, evaluar `isolate: true` por defecto con pool thread.
- **FR4 — Objetivo de tiempo:** suite claramente más rápida que 98s (objetivo pragmático <60s; el dato exacto se mide antes/después).

## 3. Non-Functional Requirements

- **NFR1 —** Cobertura global ≥80% (línea/branch) y **sin regresión** fuera de Turnstile.
- **NFR2 —** Typecheck, lint, build verdes.
- **NFR3 —** Tests deterministas: sin flakiness por el cambio de pool.
- **NFR4 —** Sin cambios de lógica de la app; solo tests y config de test.

## 4. Acceptance Criteria

- [ ] `Turnstile.tsx` reporta ≥80% en branches (y sube functions) en `npm run coverage`.
- [ ] `vite.config.ts` usa el pool recomendado para Vitest 5; la suite pasa completa.
- [ ] La suite es más rápida que en el baseline (~98s), medido en la verificación final.
- [ ] `npm run typecheck` / `npm run lint` / `npm run test` verdes.

## 5. Out of Scope

- Eliminar `jsdom` o migrar a otro entorno/test runner.
- Cambiar la lógica de `Turnstile.tsx` (solo tests).
- Optimizaciones de rendimiento de CI (paralelismo entre archivos ya lo maneja Vitest).
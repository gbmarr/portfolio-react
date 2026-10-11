# Plan: Endurecer tests — cobertura Turnstile y velocidad de la suite

> **Track ID:** `test_hardening_20261011`
> **Spec:** [./spec.md](./spec.md)
> **Status:** ✅ Completado
> **Reglas:** TDD en tests nuevos; baseline medido antes/después; commits convencionales.

---

## Fase T0 — Baseline y doc del runner

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T0.1 | Medir baseline: `npm run coverage` (Turnstile) y tiempo de `npm run test` | — | ☑️ baseline suite 73.39s (67 arch/422 tests); Turnstile 68.29% li / 50% br |
| T0.2 | Verificar opción de pool en doc de Vitest 5 (Context7 o doc oficial) | — | ☑️ doc oficial v5.0.3: `pool: 'vmThreads'` válido; mantiene aislamiento por archivo (no se puede desactivar isolate con vmThreads) |

## Fase T1 — Tests de Turnstile (TDD)

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T1.1 | Escribir `Turnstile.test.tsx` (rojo): render con siteKey, callbacks success/expired/error, ausencia de widget/siteKey | `src/components/Turnstile.test.tsx` | ☑️ 11 tests (render, success/expired/error callbacks, sin turnstile, siteKey vacío, error de script, script existente, caché, unmount remove, unmount antes de load) |
| T1.2 | Ajustar mocks de `window.turnstile` en `src/test/setup.ts` (si hace falta) hasta verde | `src/test/setup.ts`, `src/components/Turnstile.test.tsx` | ☑️ setup.ts sin cambios; mocks tipados vía `vi.fn((_el, _options) => ...)` en el propio test |
| T1.3 | Verificar branch coverage ≥80% en `Turnstile.tsx` | `npm run coverage` | ☑️ Turnstile.tsx 100% branches / 100% lines / 97.56% stmt / 91.66% funcs |

## Fase T2 — Pool de Vitest

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T2.1 | Aplicar `pool: 'vmThreads'` (o alternativo según doc) en bloque `test` | `vite.config.ts` | ☑️ `pool: 'vmThreads'` + comentario explicativo |
| T2.2 | Correr suite completa y verificar que no rompe aislamiento; ajustar si algún test depende de `isolate` | `npm run test` | ☑️ 68 archivos / 433 tests verdes; sin flakiness |
| T2.3 | Medir tiempo nuevo de la suite y documentar en plan (baseline vs. nuevo) | — | ☑️ 73.39s → 15.61s (~4.7x) |

## Fase V — Verificación final

| # | Tarea | Herramienta | Estado |
|---|-------|-------------|--------|
| V.1 | `npm run coverage` (Turnstile ≥80% branches; global ≥80%) | Vitest | ☑️ Turnstile 100% br; global 93.67% st / 86.8% br / 93.86% fn / 95.23% li |
| V.2 | `npm run typecheck` / `npm run lint` | — | ☑️ ambos verdes (lint sin output, exit 0) |
| V.3 | Commit `test(turnstile): subir cobertura a >=80% + pool vmThreads para suite más rápida` + docs del track | git | ☑️ commit `[pendiente hash]` + issue #6 cerrada |

---

## Riesgos

| Riesgo | Mitigación |
|--------|-----------|
| `pool: 'vmThreads'` rompe aislamiento de mocks entre archivos | Verificar con suite completa; si hay flakiness, probar `pool: 'threads'` con `isolate: false` documentado |
| El widget de Turnstile no se puede mockear fácil en jsdom | Mock de `window.turnstile` con funciones `render`/`remove` en setup; confirmar nombre de callbacks con la doc de Turnstile |
| Tiempo no mejora sustancialmente | Medir y reportar; si gana <20s, documentar y mantener el pool igual (valores comunicados al dueño) |
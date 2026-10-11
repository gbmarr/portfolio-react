# Plan: Endurecer tests — cobertura Turnstile y velocidad de la suite

> **Track ID:** `test_hardening_20261011`
> **Spec:** [./spec.md](./spec.md)
> **Status:** 🔜 Pendiente
> **Reglas:** TDD en tests nuevos; baseline medido antes/después; commits convencionales.

---

## Fase T0 — Baseline y doc del runner

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T0.1 | Medir baseline: `npm run coverage` (Turnstile) y tiempo de `npm run test` | — | ⬜ |
| T0.2 | Verificar opción de pool en doc de Vitest 5 (Context7 o doc oficial) | — | ⬜ |

## Fase T1 — Tests de Turnstile (TDD)

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T1.1 | Escribir `Turnstile.test.tsx` (rojo): render con siteKey, callbacks success/expired/error, ausencia de widget/siteKey | `src/components/Turnstile.test.tsx` | ⬜ |
| T1.2 | Ajustar mocks de `window.turnstile` en `src/test/setup.ts` (si hace falta) hasta verde | `src/test/setup.ts`, `src/components/Turnstile.test.tsx` | ⬜ |
| T1.3 | Verificar branch coverage ≥80% en `Turnstile.tsx` | `npm run coverage` | ⬜ |

## Fase T2 — Pool de Vitest

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T2.1 | Aplicar `pool: 'vmThreads'` (o alternativo según doc) en bloque `test` | `vite.config.ts` | ⬜ |
| T2.2 | Correr suite completa y verificar que no rompe aislamiento; ajustar si algún test depende de `isolate` | `npm run test` | ⬜ |
| T2.3 | Medir tiempo nuevo de la suite y documentar en plan (baseline vs. nuevo) | — | ⬜ |

## Fase V — Verificación final

| # | Tarea | Herramienta | Estado |
|---|-------|-------------|--------|
| V.1 | `npm run coverage` (Turnstile ≥80% branches; global ≥80%) | Vitest | ⬜ |
| V.2 | `npm run typecheck` / `npm run lint` | — | ⬜ |
| V.3 | Commit `test(turnstile): subir cobertura a >=80% + pool vmThreads para suite más rápida` + docs del track | git | ⬜ |

---

## Riesgos

| Riesgo | Mitigación |
|--------|-----------|
| `pool: 'vmThreads'` rompe aislamiento de mocks entre archivos | Verificar con suite completa; si hay flakiness, probar `pool: 'threads'` con `isolate: false` documentado |
| El widget de Turnstile no se puede mockear fácil en jsdom | Mock de `window.turnstile` con funciones `render`/`remove` en setup; confirmar nombre de callbacks con la doc de Turnstile |
| Tiempo no mejora sustancialmente | Medir y reportar; si gana <20s, documentar y mantener el pool igual (valores comunicados al dueño) |
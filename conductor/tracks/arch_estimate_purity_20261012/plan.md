# Plan — Pureza del estimador (`arsRate` inyectado + límites unificados)

> **Track ID:** `arch_estimate_purity_20261012`
> **Spec:** [./spec.md](./spec.md)
> **Status:** ⏳ Pendiente
> **Reglas:** mismos precios; función pura de sus argumentos; tests deterministas.

---

## Fase T0 — Pureza e inyección

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T0.1 | `computeEstimate(input, arsRate)` (default = rate resuelto) | `src/lib/estimate.ts` | ⬜ |
| T0.2 | Separar config (`resolveArsRate`/`arsRate`) del catálogo puro | `src/data/estimate.ts` | ⬜ |
| T0.3 | `buildEstimateWhatsAppMessage` reutiliza el `breakdown` (sin re-derivar extras) | `src/lib/estimate.ts` | ⬜ |
| T0.4 | Tests deterministas con `arsRate` fijo | `src/lib/estimate.test.ts` | ⬜ |

## Fase T1 — Unificar límites de secciones

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T1.1 | Exportar `MIN_SECTIONS`/`MAX_SECTIONS` desde un único módulo | `src/lib/estimate.ts` (o `src/data/estimate.ts`) | ⬜ |
| T1.2 | `Estimator.tsx` importa los límites (slider `:96-97` y validación `:17-18`) | `src/sections/Estimator.tsx` | ⬜ |

## Fase V — Verificación

| # | Tarea | Herramienta | Estado |
|---|-------|----------|--------|
| V.1 | `npm run test` (suite verde, cobertura ≥80 %) | Vitest | ⬜ |
| V.2 | `npm run typecheck` / `npm run lint` | tsc / ESLint | ⬜ |
| V.3 | Comparar salida del estimador antes/después con el mismo input | manual / test de snapshot | ⬜ |
| V.4 | Smoke manual: slider de secciones (mín/máx) y mensaje de WhatsApp | manual | ⬜ |
| V.5 | Commit `refactor(arch): estimador puro (arsRate inyectado, límites unificados)` + docs del track | git | ⬜ |

---

## Riesgos

| Riesgo | Mitigación |
|--------|-----------|
| Cambio accidental de precios al inyectar el rate | Test que fije un `arsRate` conocido y compare contra el valor actual |
| Import de `import.meta.env` en tests (entorno Node) | Default resuelto fuera del test; el test pasa el rate explícito |

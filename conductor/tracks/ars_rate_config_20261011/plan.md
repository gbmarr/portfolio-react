# Plan: Cotización arsRate configurable del estimador

> **Track ID:** `ars_rate_config_20261011`
> **Spec:** [./spec.md](./spec.md)
> **Status:** 🔜 Pendiente
> **Reglas:** TDD en lógica pura; build verde en cada fase; commits convencionales.

---

## Fase T0 — Lógica de resolución (TDD)

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T0.1 | Escribir tests de `resolveArsRate(raw)`: válido, vacío, no numérico, negativo, NaN → fallback 1400 (rojo) | `src/data/estimate.test.ts` | ☑️ |
| T0.2 | Implementar `resolveArsRate` y `arsRate = resolveArsRate(import.meta.env.ARS_RATE)` | `src/data/estimate.ts` | ☑️ |

## Fase T1 — Integración de Vite

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T1.1 | Agregar `'ARS_'` a `envPrefix` | `vite.config.ts` | ☑️ |
| T1.2 | Documentar `ARS_RATE=` en `.env.example` (opcional, default 1400, público por diseño) + tipado `ImportMetaEnv` | `.env.example`, `src/vite-env.d.ts` | ☑️ |

## Fase V — Verificación final

| # | Tarea | Herramienta | Estado |
|---|-------|-------------|--------|
| V.1 | `npm run typecheck` / `npm run lint` | — | ☑️ |
| V.2 | `npm run test` y `npm run coverage` (≥80%) | Vitest | ☑️ |
| V.3 | (opcional) `npm run build` con `ARS_RATE=1450` y verificar el estimador | `npm run build` + preview | ⬜ |
| V.4 | Commit `feat(estimator): arsRate configurable vía env ARS_RATE con fallback` + docs del track | git | ⬜ |

---

## Riesgos

| Riesgo | Mitigación |
|--------|-----------|
| `import.meta.env.ARS_RATE` no tipado en TS | Tipar vía `ImportMetaEnv` en `src/vite-env.d.ts` si hace falta |
| Confundir ARS_RATE con una variable secreta | Documentar que es pública; el prefijo ARS_ la inlinea en el bundle |
| Valor desactualizado en producción | El dueño actualiza `ARS_RATE` en el dashboard del host sin redeploy del código |
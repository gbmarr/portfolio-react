# Track: Eliminar la urgencia exprés del estimador

## 1. Overview

Eliminar por completo la opción de urgencia exprés ("Lo necesito en menos de una semana
(exprés)") del estimador de presupuesto (`#estimador`), incluyendo su UI, su lógica de
cálculo (multiplicador ×1.3, plazo y desglose), la mención en el mensaje de WhatsApp y
los tests asociados. No se toca el comportamiento base de precios/plazos ni el fair-use
(todo sigue client-side, cero fetch).

## 2. Functional Requirements

- FR1 — El `Estimator` no renderiza el checkbox de urgencia exprés.
- FR2 — `computeEstimate` no aplica multiplicador ×1.3 ni altera `timeline` por urgencia.
- FR3 — `buildEstimateWhatsAppMessage` no menciona "urgencia exprés".
- FR4 — No quedan símbolos ni referencias a `express` / `EXPRESS_MULTIPLIER` /
  `expressTimeline` / `expressLabel` en `src/`.
- FR5 — El resto del estimador (tiers, secciones, extras, ARS, CTA WhatsApp) sigue igual.

## 3. Non-Functional Requirements

- NFR1 — Cobertura de tests >80% (workflow.md).
- NFR2 — Build y suite (Vitest) verdes; TDD (red→green).
- NFR3 — Sin cambios de DB, migraciones ni serverless (fair-use intacto).

## 4. Acceptance Criteria

- [ ] `npm run test` (Vitest) pasa sin los casos de exprés.
- [ ] `npm run build` / typecheck pasan.
- [ ] `rg "express" src/` no devuelve resultados.
- [ ] El estimador funciona igual salvo la ausencia del checkbox.

## 5. Out of Scope

- Editar specs históricos (track `fairuse_20261008`, D8): quedan como registro.
- Texto/CTA de reemplazo por tiempos de entrega.
- Cualquier cambio de precios, tiers, extras o plazos base.

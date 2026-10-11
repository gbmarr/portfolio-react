# Plan: Eliminar la urgencia exprés del estimador

## Fase 1 — Tests (RED)

- [x] Task: Ajustar los tests para la eliminación
    - [x] `src/lib/estimate.test.ts`: quitar `express` de `base` y de todos los casos;
          eliminar "applies the express multiplier of 1.3" y "lets express prevail";
          ajustar el test de desglose y el de WhatsApp (sin urgencia).
    - [x] `src/sections/Estimator.test.tsx`: quitar import de `expressTimeline` y el test
          "applies express urgency"; agregar regresión "no renderiza la opción exprés".
    - [x] Ejecutar Vitest y confirmar rojo/errores esperados.
- [x] Task: Conductor - User Manual Verification 'Fase 1 — Tests (RED)' (Protocol in workflow.md)

## Fase 2 — Implementación (GREEN)

- [x] Task: Remover la lógica de exprés
    - [x] `src/data/copy.ts`: eliminar `expressLabel`.
    - [x] `src/data/estimate.ts`: eliminar `expressTimeline`.
    - [x] `src/lib/estimate.ts`: quitar `express` de `EstimateInput`, `EXPRESS_MULTIPLIER`,
          el parámetro de `buildTimeline`, el cálculo ×1.3 + fila de desglose y la mención
          en el mensaje de WhatsApp.
    - [x] `src/sections/Estimator.tsx`: quitar el estado `express`, del `useMemo` de input
          y el bloque del checkbox.
    - [x] Ejecutar Vitest hasta verde (GREEN).
- [x] Task: Conductor - User Manual Verification 'Fase 2 — Implementación (GREEN)' (Protocol in workflow.md)

## Fase 3 — Verificación y cierre

- [x] Task: Verificar cobertura, build y ausencia de referencias
    - [x] Confirmar cobertura >80% con el tooling de Vitest (92.72% stmts).
    - [x] `npm run build` (o typecheck) en verde.
    - [x] `grep "express|exprés|EXPRESS" src/` sin referencias residuales de la feature.
- [x] Task: Commit (`refactor(estimator): remove express urgency option`).
- [x] Task: Conductor - User Manual Verification 'Fase 3 — Verificación y cierre' (Protocol in workflow.md)

## Phase: Review Fixes

- [x] Task: Apply review suggestions aec42e7

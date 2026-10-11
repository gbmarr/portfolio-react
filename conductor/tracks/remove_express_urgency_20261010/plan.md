# Plan: Eliminar la urgencia exprés del estimador

## Fase 1 — Tests (RED)

- [ ] Task: Ajustar los tests para la eliminación
    - [ ] `src/lib/estimate.test.ts`: quitar `express` de `base` y de todos los casos;
          eliminar "applies the express multiplier of 1.3" y "lets express prevail";
          ajustar el test de desglose y el de WhatsApp (sin urgencia).
    - [ ] `src/sections/Estimator.test.tsx`: quitar import de `expressTimeline` y el test
          "applies express urgency".
    - [ ] Ejecutar Vitest y confirmar rojo/errores esperados.
- [ ] Task: Conductor - User Manual Verification 'Fase 1 — Tests (RED)' (Protocol in workflow.md)

## Fase 2 — Implementación (GREEN)

- [ ] Task: Remover la lógica de exprés
    - [ ] `src/data/copy.ts`: eliminar `expressLabel`.
    - [ ] `src/data/estimate.ts`: eliminar `expressTimeline`.
    - [ ] `src/lib/estimate.ts`: quitar `express` de `EstimateInput`, `EXPRESS_MULTIPLIER`,
          el parámetro de `buildTimeline`, el cálculo ×1.3 + fila de desglose y la mención
          en el mensaje de WhatsApp.
    - [ ] `src/sections/Estimator.tsx`: quitar el estado `express`, del `useMemo` de input
          y el bloque del checkbox.
    - [ ] Ejecutar Vitest hasta verde (GREEN).
- [ ] Task: Conductor - User Manual Verification 'Fase 2 — Implementación (GREEN)' (Protocol in workflow.md)

## Fase 3 — Verificación y cierre

- [ ] Task: Verificar cobertura, build y ausencia de referencias
    - [ ] Confirmar cobertura >80% con el tooling de Vitest.
    - [ ] `npm run build` (o typecheck) en verde.
    - [ ] `rg "express" src/` sin resultados.
- [ ] Task: Commit (`refactor(estimator): remove express urgency option`).
- [ ] Task: Conductor - User Manual Verification 'Fase 3 — Verificación y cierre' (Protocol in workflow.md)

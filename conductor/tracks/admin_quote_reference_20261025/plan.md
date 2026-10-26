# Plan de implementación

## Fases

### T0: Auditoría
- [ ] Verificar imports públicos de estimate/lib/estimate
- [ ] Confirmar no hay referencias a precios en componentes públicos

### T1: Restaurar catálogo y cálculo
- [ ] src/data/estimate.ts: agregar baseUsd a tiers, precios a extras (mismos valores históricos)
- [ ] src/lib/estimate.ts: restaurar computeEstimate, mantener buildEstimateTimeline

### T2: Panel admin
- [ ] src/pages/admin/QuoteRequestsPage.tsx: importar computeEstimate, resolveArsRate, formatMoney. Calcular con {tier, sections, extras: request.extras}
- [ ] Mostrar ""Estimado (referencia)"" con rango USD min-max, ARS aprox, timeline y desglose
- [ ] Solo lectura, sin botones de edición
- [ ] Tests: QuoteRequestsPage.test.tsx

### T3: Verificación y commit
- [ ] Grep: verificar sin precios en componentes públicos
- [ ] npm run test, npm run typecheck, npm run lint, npm run build
- [ ] Commit: feat(admin): show quote estimate reference in requests panel

# Spec — Coherencia de checks del estimador (matriz tier↔extra)

> **Track ID:** `estimator_tier_extras_20261010`
> **Fuente:** análisis en profundidad solicitado por el usuario sobre la lógica de combinaciones de los checks del estimador.
> **Estado:** ✅ **Implementado y verificado** (2026-10-10). Todos los checks verdes (typecheck, lint, 416 tests, cobertura 92.7% statements).

---

## 1. Contexto y objetivo

El estimador de presupuesto permite elegir un tier (`landing` / `institucional` / `medida`) y un conjunto de extras (blog, integraciones, multidioma, logo, copy, ecommerce, seo). El análisis reveló combinaciones ilógicas y un arbitraje de precio:

- Una **landing** (página única) podía marcar "Módulo de tienda online" (contradictorio).
- Un sitio **institucional** con 3 secciones + tienda (450 + 600 = **1050**) salía **más barato** que un **medida** (1200), pese a ser equivalente — arbitraje.
- `integradores` (Mercado Pago) y `ecommerce` conviven mal: doble cobro conceptual si se marcan juntos.
- Un **medida** arrastraba preguntas de tienda (cantidad de ítems, cobro, envíos) aunque no fuera un e-commerce.
- Inconsistencia público↔admin: el público auto-incluía la tienda en `medida`, pero el admin la mostraba como checkbox libre (podía guardar un `medida` sin tienda → brief/etapas sin tienda).
- Copy divergente: "Hasta 5 secciones" en `services.ts`/`servicios.md` vs. base de 3 secciones en el estimador.

**Objetivo:** hacer que cada combinación tier↔extra sea lógica, consistente entre el estimador público y el panel admin, y sin arbitrajes de precio — declarando la compatibilidad en **una única matriz** como fuente de verdad.

### Decisión de arquitectura (confirmada con el usuario)
Implementar el **híbrido A+D**: matriz de compatibilidad tier↔extra (nueva fuente única) **+** reconciliación de todas las señales derivadas (brief, etapas, copy).

---

## 2. Matriz de compatibilidad (fuente única)

| Extra | landing | institucional | medida |
|---|---|---|---|
| logo | ✅ | ✅ | ✅ |
| copy | ✅ | ✅ | ✅ |
| multidioma | ✅ | ✅ | ✅ |
| seo | ✅ | ✅ | ✅ |
| integraciones | ✅ | ✅ | ✅ |
| blog | ❌ | ✅ | ✅ |
| ecommerce | ❌ (ni visible) | ❌ (ni visible) | **incluido** (no seleccionable, no cobrado) |

La matriz se declara con `tiers: EstimateTierId[]` (dónde el extra es seleccionable) e `includedFor?: EstimateTierId[]` (dónde viene incluido sin cobro ni checkbox). `getVisibleExtras(tier) = selectable ∪ included`; `getIncludedExtras(tier)` y `isExtraAllowed(tier, id)` derivan del mismo dato.

---

## 3. Functional Requirements

- **FR1 — Matriz fuente única:** `src/data/estimate.ts` expone tipos `EstimateExtraBase/Fixed/Percent` con `tiers`/`includedFor`, y helpers `getSelectableExtras`, `getIncludedExtras`, `getVisibleExtras`, `isExtraAllowed`. Test dedicado `src/data/estimate.test.ts`.
- **FR2 — Estimador público:** `Estimator.tsx` renderiza solo `getVisibleExtras(tier)`; el extra incluido se muestra deshabilitado, marcado y con "Incluido en este plan". Al cambiar de tier se **podan** los extras que dejan de aplicar (no persisten en `selectedExtras`).
- **FR3 — Cálculo defensivo:** `computeEstimate` filtra `input.extras` con `isExtraAllowed` (ignora inválidos); `timeline` cuenta solo extras válidos (antes contaba ids inválidos y alargaba el plazo); `buildEstimateWhatsAppMessage` clampa `sections` a 3–8 y filtra extras por tier.
- **FR4 — Admin:** `ProjectFormPage.tsx` muestra los extras de `getVisibleExtras(service_type)`; elegir `medida` agrega `ecommerce` a `extra_ids` automáticamente (checkbox deshabilitado, "— incluido"); al cambiar de servicio poda incompatibles y añade incluidos (`withIncludedExtras`), también al normalizar un brief cargado.
- **FR5 — Brief:** `medidaSections` ya no fuerza catálogo/cobro/envíos; esas preguntas quedan en la sección del extra `ecommerce` (catalogo_tienda, medios_pago, envios_tienda). Un `medida` sin tienda deja de arrastrar preguntas de e-commerce.
- **FR6 — Copy reconciliado:** `services.ts` y `conductor/servicios.md` dicen "3 secciones base (hasta 8 con secciones extra)".

## 4. Non-Functional Requirements

- **NFR1 —** Cobertura >80% (workflow.md). Se mide con el tooling de Vitest.
- **NFR2 —** Build, typecheck, lint y suite verdes; TDD (red→green).
- **NFR3 —** Sin cambios de DB ni migraciones; el fair-use queda intacto (todo client-side).
- **NFR4 —** La matriz es la única fuente: un extra nuevo solo declara `tiers`/`includedFor`.

## 5. Acceptance Criteria (todos cumplidos)

- [x] `landing` no ofrece blog ni tienda; un id de tienda en `input.extras` no se cobra ni alarga el plazo (test: 250/300).
- [x] `medida` con/sin `ecommerce` da el mismo precio (1200/1440); la tienda aparece como "Incluido en este plan" (público) y checkbox deshabilitado + `extra_ids` con `ecommerce` (admin).
- [x] Cambiar de tier poda extras incompatibles (test: institucional + blog 760 → landing 250 sin blog).
- [x] El brief `medida` sin e-commerce no pide catálogo/cobro/envíos; con el extra `ecommerce`, sí (sección tienda).
- [x] WhatsApp acota secciones (99 → 8) y no menciona la tienda en `landing`.
- [x] `services.ts` y `servicios.md` muestran "3 secciones base".
- [x] `npm run typecheck`, `npm run lint`, `npm run test` (416) y `npm run coverage` (92.71% stmts / 85.84% branches / 92.56% funcs / 94.51% lines) verdes.

## 6. Out of Scope

- Valor real de `arsRate` (queda el TODO existente).
- Cambios de precios base o de la escala de secciones del slider.
- Migraciones de briefs existentes guardados sin `ecommerce` (ver 7).
- `.agents/skills/security-audit/` (carpeta ajena, no se toca ni se commitea).

## 7. Notas de comportamiento / migración

Un brief `medida` guardado **sin** `ecommerce` tomará el extra al abrir el form de edición (normalización con `withIncludedExtras`); al guardar, `upsertBrief` reinicia `answers`/`status` del cliente (comportamiento preexistente de upsert al cambiar `service_type`/`extra_ids`). Es una migración de una sola vez y ya está documentado en `src/lib/briefs.ts`.

## 8. Commits del track

`feat(estimator): tier-extras compatibility matrix (blog/tienda coherentes, tienda incluida en medida, brief sin e-commerce forzado, copy 3 secciones base)` — ver plan.md.
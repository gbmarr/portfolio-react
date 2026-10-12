# Spec — Pureza del estimador: inyectar `arsRate` y unificar los límites de secciones

> **Track ID:** `arch_estimate_purity_20261012`
> **Fuente:** Revisión de arquitectura del codebase (candidato C6, fuerza **Speculative**).
> **Estado:** ⏳ Pendiente (spec + plan; sin implementar).
> **Vocabulario:** `module` / `interface` / `seam` / `locality` (skill `codebase-design`).

---

## 1. Contexto y objetivo

`computeEstimate` (`src/lib/estimate.ts:62-116`) es un módulo profundo —las reglas de precio viven solo ahí— pero su salida **no es función pura de su argumento**: en `:111-112` multiplica por un `arsRate` a nivel de módulo, resuelto en `src/data/estimate.ts:154-157` desde `import.meta.env.PUBLIC_ARS_RATE`. Testear un resultado determinista obliga a depender del rate por defecto.

Además, los límites de secciones están duplicados: `MIN_SECTIONS = 3` / `MAX_SECTIONS = 8` en `src/lib/estimate.ts:33-34` **y** en `src/sections/Estimator.tsx:17-18`, con el slider en `:96-97`. El clamp de precio (`estimate.ts:65`) y el slider de la UI pueden derivar.

Y dentro del módulo, `buildEstimateWhatsAppMessage` (`:118-134`) vuelve a derivar las extras válidas y sus etiquetas que `computeEstimate` ya había resuelto en `breakdown` (`:82-85` vs `:126-127`).

**Objetivo:** `computeEstimate` recibe `arsRate` por parámetro (inyección de dependencia), los límites de secciones tienen un solo hogar, y el mensaje de WhatsApp parte del `breakdown` ya calculado.

## 2. Functional Requirements

- **FR1 —** `computeEstimate(input, arsRate)` recibe el tipo de cambio por parámetro (con default = rate resuelto del entorno, para no romper callers).
- **FR2 —** `MIN_SECTIONS` / `MAX_SECTIONS` se exportan desde un único módulo; `Estimator.tsx` los importa (slider y clamp dejan de duplicarse).
- **FR3 —** `buildEstimateWhatsAppMessage` reutiliza las extras/labels del `breakdown` en vez de recalcularlas.
- **FR4 —** Separar la lectura de config (`resolveArsRate`/`arsRate`) del catálogo puro en `src/data/estimate.ts`, para que catálogo y cómputo sean puros.

## 3. Non-Functional Requirements

- **NFR1 —** `computeEstimate` es una función pura de sus argumentos (mismo input + mismo `arsRate` ⇒ mismo output).
- **NFR2 —** Sin cambio de precios ni de comportamiento visible (mismos valores que hoy).
- **NFR3 —** Tests deterministas: fijar `arsRate` en vez de depender del default del entorno.
- **NFR4 —** `npm run test` / `typecheck` / `lint` verdes; cobertura no baja.

## 4. Acceptance Criteria

- [ ] `computeEstimate` no lee estado a nivel de módulo; recibe `arsRate`.
- [ ] `MIN_SECTIONS`/`MAX_SECTIONS` existen en un solo lugar e `Estimator.tsx` los importa.
- [ ] `buildEstimateWhatsAppMessage` no re-deriva las extras válidas.
- [ ] Tests del estimador deterministas con `arsRate` fijo.
- [ ] Suite, typecheck y lint verdes.

## 5. Out of Scope

- Cambiar la fórmula de precios o los tramos.
- Mover el catálogo de tramos/extras (se mantiene en `src/data/estimate.ts`; solo se separa la config).
- Extraer un componente compartido del fieldset de extras (fricción aparte, no incluida aquí).

## 6. Decisión abierta

- **D1 —** Default de `arsRate`: `computeEstimate(input, arsRate = resolveArsRate(import.meta.env.PUBLIC_ARS_RATE))` para compatibilidad, o hacer el parámetro obligatorio y actualizar los callers. Recomendado: default explícito (mínimo cambio).

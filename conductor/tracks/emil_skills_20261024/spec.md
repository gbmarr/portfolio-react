# Spec — Skills de Emil Kowalski (subset curado)

> **Track ID:** `emil_skills_20261024`
> **Fuente:** Pedido del owner (2026-10-24), análisis de `emilkowalski/skills` e `pbakaus/impeccable`.
> **Estado:** Implementado.

---

## 1. Contexto y objetivo

El repo ya tiene skills de ingeniería y un design system propio (`.opencode/skills/portfolio-design`). Se evaluó incorporar dos colecciones externas:

- `emilkowalski/skills`: foco en diseño de interacción, motion, rendimiento y mobile.
- `pbakaus/impeccable`: lenguaje de diseño + auditoría, con reglas que chocan con el sistema actual (Inter, fondo oscuro, cards, glow) y telemetría/hooks.

**Objetivo:** incorporar solo el subconjunto de Emil que aporta valor real al stack, sin duplicar skills existentes ni cambiar la autoridad visual del proyecto.

## 2. Functional Requirements

- **FR1 —** Instalar en `.agents/skills` un subset curado de `emilkowalski/skills`.
- **FR2 —** Registrar las skills instaladas en `skills-lock.json`.
- **FR3 —** No instalar `pbakaus/impeccable` (conflicto de design system + telemetría/hooks).
- **FR4 —** Documentar la precedencia: `portfolio-design` manda en tokens, colores, tipografía y patrones; Emil solo aporta criterio de motion/interacción.
- **FR5 —** No reemplazar ni duplicar `prototype` (ya existe una skill equivalente).

## 3. Non-Functional Requirements

- **NFR1 —** Sin dependencias de runtime ni cambios al bundle.
- **NFR2 —** Sin cambios de comportamiento en la app.
- **NFR3 —** Instalación reproducible vía `skills-lock.json`.

## 4. Acceptance Criteria

- [x] Skills seleccionadas instaladas.
- [x] `skills-lock.json` actualizado.
- [x] Precedencia documentada en `conductor/tech-stack.md`.
- [x] `npm run test`, `typecheck`, `lint`, `build` verdes.

## 5. Out of Scope

- `pbakaus/impeccable`.
- `animate-expo`, `write-swift`, `apple-design`, `pick-ui-library`, `ask-sonner`, `prototype`.
- Aplicar cambios de diseño/motion al sitio en este track.

## 6. Decisión

Instalar: `emil-design-eng`, `animate`, `review-animations`, `improve-animations`, `animation-performance`, `animation-vocabulary`, `mobile-native`, `break-ui`.

Descartar: `pbakaus/impeccable`, `animate-expo`, `write-swift`, `apple-design`, `pick-ui-library`, `ask-sonner`, `prototype`, `find-animation-opportunities` (se puede evaluar luego).

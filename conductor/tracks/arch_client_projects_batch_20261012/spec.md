# Spec — Batch de etapas para el listado del cliente (eliminar el N+1)

> **Track ID:** `arch_client_projects_batch_20261012`
> **Fuente:** Revisión de arquitectura del codebase (candidato C5, fuerza **Worth exploring**).
> **Estado:** ⏳ Pendiente (spec + plan; sin implementar).
> **Vocabulario:** `module` / `interface` / `seam` / `locality` / `leverage` (skill `codebase-design`).

---

## 1. Contexto y objetivo

`src/pages/client/ClientProjectsPage.tsx:30-35` arma el progreso de cada proyecto con una consulta de etapas **por proyecto**:

```
Promise.all(projects.map(async (p) => listStages(p.id)))
```

Es un N+1: la página decide la estrategia de consulta. La función pura `computeProgress` (`src/lib/projects.ts:80`) es correcta; el defecto está en **cómo se llama** — no hay un seam que traiga las etapas de varios proyectos en una sola consulta. La página filtra estrategia de datos a través de su render.

**Objetivo:** profundizar la capa de datos con un módulo que traiga las etapas de **varios** proyectos en una consulta (`listStagesForProjects(ids)` o un agregado `loadClientProjects`), y que la página consuma ese interface.

## 2. Functional Requirements

- **FR1 —** La capa de datos expone `listStagesForProjects(ids: string[])` (una sola consulta `in(...)`, agrupada por `project_id`) o un agregado `loadClientProjects(...)` que devuelva proyecto + etapas.
- **FR2 —** `ClientProjectsPage` deja de mapear `listStages` por proyecto; usa el nuevo interface.
- **FR3 —** `computeProgress` se sigue usando para calcular el progreso a partir de las etapas ya traídas.
- **FR4 —** Manejo del caso "sin proyectos" sin emitir una consulta vacía inválida.

## 3. Non-Functional Requirements

- **NFR1 —** El módulo se testea en su **interface** (Supabase mockeado): ids vacíos, un proyecto, varios.
- **NFR2 —** Mismo resultado visible que hoy (mismo progreso por proyecto).
- **NFR3 —** Una sola ida a la base por render del listado (no N+1).
- **NFR4 —** `npm run test` / `typecheck` / `lint` verdes; cobertura no baja.

## 4. Acceptance Criteria

- [ ] Existe una función de capa de datos que trae etapas de varios proyectos en una consulta.
- [ ] `ClientProjectsPage` no llama a `listStages` dentro de un `map` (grep).
- [ ] Test del nuevo interface (ids vacíos / uno / varios) verde.
- [ ] Suite, typecheck y lint verdes.

## 5. Out of Scope

- Paginación del listado de proyectos.
- Cambiar el esquema o las políticas RLS de `project_stages`.
- Cachear resultados entre renders (fuera del alcance; ver C1 para el hook de carga).

## 6. Decisión abierta

- **D1 —** Forma: `listStagesForProjects(ids): Promise<Record<string, ProjectStage[]>>` vs. `loadClientProjects(): Promise<{ project, stages }[]>`. Recomendado: `listStagesForProjects` (más pequeño y reutilizable).

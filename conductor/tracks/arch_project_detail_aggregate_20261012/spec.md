# Spec — Agregado de detalle de proyecto en la capa de datos (`loadProjectDetail`)

> **Track ID:** `arch_project_detail_aggregate_20261012`
> **Fuente:** Revisión de arquitectura del codebase (candidato C2, fuerza **Strong**).
> **Estado:** ⏳ Pendiente (spec + plan; sin implementar).
> **Vocabulario:** `module` / `interface` / `seam` / `locality` / `leverage` (skill `codebase-design`).

---

## 1. Contexto y objetivo

El agregado de dominio "detalle de proyecto" no tiene un hogar en la capa de datos: cada página que lo necesita lo vuelve a declarar y lo vuelve a ensamblar.

- `src/pages/admin/ProjectDetailPage.tsx:25-56` — tipo `Detail` + `load()` con `Promise.all([getProject, listStages, listApprovals, getBrief])`.
- `src/pages/client/ClientProjectDetailPage.tsx:24-67` — el mismo `Detail` y el mismo `Promise.all`, re-declarado.

Además, la UX de "no encontrado" se ramifica por el **string exacto** producido en `lib` (`ClientProjectDetailPage.tsx:78` compara `error.message === 'Proyecto no encontrado'`, definido en `src/lib/projects.ts:46`). Es un **seam filtrado**: renombrar el mensaje rompe el comportamiento en silencio, y ningún caller puede distinguir "no encontrado" de un error de RLS o de red.

**Objetivo:** profundizar `src/lib/projects.ts` con `loadProjectDetail(id): Promise<ProjectDetail>` y un error de "no encontrado" tipado. Las dos páginas consumen un único **interface**; el string-match desaparece.

## 2. Functional Requirements

- **FR1 —** `loadProjectDetail(id: string): Promise<ProjectDetail>` ensambla `{ project, stages, approvals, brief }` en un solo módulo.
- **FR2 —** El tipo `ProjectDetail` vive una sola vez, exportado desde la capa de datos.
- **FR3 —** "No encontrado" se expresa con un error **tipado** (p. ej. `ProjectNotFoundError`), no con un string; los callers ramifican por tipo, no por mensaje.
- **FR4 —** `ProjectDetailPage` y `ClientProjectDetailPage` consumen `loadProjectDetail` y el tipo compartido.

## 3. Non-Functional Requirements

- **NFR1 —** El agregado se testea en el **interface** de la capa de datos (con el cliente Supabase mockeado), sin renderizar páginas.
- **NFR2 —** Sin cambio de comportamiento observable en el panel admin ni en el portal del cliente.
- **NFR3 —** `npm run test` / `typecheck` / `lint` verdes; cobertura no baja.

## 4. Acceptance Criteria

- [ ] `loadProjectDetail` + `ProjectDetail` exportados desde `src/lib`.
- [ ] Ninguna página declara su propio `Detail` ni arma el `Promise.all` de cuatro consultas.
- [ ] El string `'Proyecto no encontrado'` ya no se compara en ninguna página (grep).
- [ ] Suite, typecheck y lint verdes.

## 5. Out of Scope

- Cambiar el esquema de RLS o las tablas.
- Fusionar las cuatro consultas en una sola query SQL/RPC (posible follow-up; el agregado puede seguir usando `Promise.all` internamente).
- El batching de etapas del listado del cliente — ver candidato C5.

## 6. Decisión abierta

- **D1 —** Ubicación: `src/lib/projects.ts` (junto a las funciones de proyecto) vs. un módulo `src/lib/project-detail.ts`. Recomendado: `src/lib/projects.ts`.

# Spec — Profundizar los loaders async en un único módulo (`useAsyncData` + `Loading`/`ErrorAlert`)

> **Track ID:** `arch_async_data_hook_20261012`
> **Fuente:** Revisión de arquitectura del codebase (candidato C1, fuerza **Strong**).
> **Estado:** ⏳ Pendiente (spec + plan; sin implementar).
> **Vocabulario:** `module` / `interface` / `depth` / `seam` / `locality` / `leverage` (skill `codebase-design`).

---

## 1. Contexto y objetivo

Ocho páginas repiten a mano la misma máquina de estados para cargar datos asíncronos: una unión discriminada `State`, un `useState({ loading: true })`, un `useEffect` con la bandera `cancelled`, un `try/catch` que cae a `panelCopy.error.generic`, y el mismo bloque JSX de carga (`<p role="status" className="animate-pulse…">`) y de error (`<p role="alert" … red-400/40 …>`). No existe ningún `useAsyncData`/`useQuery` en el repo (`src/hooks/` solo tiene `useScrollReveal.ts`).

Entender el flujo de datos de una página obliga a releer el mismo boilerplate en las ocho. `panelCopy.error.generic` aparece ~16 veces.

**Objetivo:** profundizar un módulo `useAsyncData(loader, deps)` con una interfaz pequeña (`{ data, error, loading, reload }`) que absorba la máquina de estados, más un `Loading` y un `ErrorAlert` compartidos. Las páginas conservan su render propio; el **interface** se lleva el estado.

**Páginas afectadas:**

- `src/pages/admin/AdminDashboard.tsx` (State `:11-13`, effect `:40-70`, loading `:72-78`, error `:80-86`)
- `src/pages/admin/ProjectsListPage.tsx` (State `:9-11`, effect `:17-29`)
- `src/pages/admin/ProjectDetailPage.tsx` (State `:32-34`, load/effect `:47-81`)
- `src/pages/admin/ClientsPage.tsx` (State `:7-9`, effect `:19-31`)
- `src/pages/admin/MessagesPage.tsx` (State `:9-11`, effect `:19-31`)
- `src/pages/admin/ProjectFormPage.tsx` (State `:68-70`, effect `:97-138`)
- `src/pages/client/ClientProjectsPage.tsx` (State `:16-18`, effect `:24-46`)
- `src/pages/client/ClientProjectDetailPage.tsx` (State `:31-33`, load/effect `:58-88`)

## 2. Functional Requirements

- **FR1 —** `useAsyncData<T>(loader: () => Promise<T>, deps: DependencyList)` devuelve `{ data: T | null, error: string | null, loading: boolean, reload: () => Promise<void> }`, resolviendo la cancelación al desmontar y mapeando un error lanzado a un mensaje (`panelCopy.error.generic` por defecto).
- **FR2 —** Un `<Loading />` compartido reemplaza el bloque `role="status"` repetido; un `<ErrorAlert />` compartido reemplaza el bloque `role="alert"` repetido (mismo estilo y roles ARIA actuales).
- **FR3 —** Las ocho páginas consumen el hook y los componentes compartidos, sin cambiar la semántica observable (loading/error/éxito idénticos).
- **FR4 —** `reload()` soporta el refresco posterior a una acción (patrón `refresh()` de `ProjectDetailPage`/`ClientProjectDetailPage`).

## 3. Non-Functional Requirements

- **NFR1 —** El **interface es la superficie de test**: el hook se prueba a través de su interfaz con un loader falso (resolución, rechazo, cancelación al desmontar, `reload`).
- **NFR2 —** Sin cambio de comportamiento: los mensajes, roles ARIA y estados visibles se mantienen.
- **NFR3 —** `npm run test` / `typecheck` / `lint` verdes; cobertura no baja del umbral (≥80 %).

## 4. Acceptance Criteria

- [ ] `useAsyncData` existe, está testeado a través de su interfaz y cubre cancelación + `reload`.
- [ ] Las ocho páginas usan el hook; no queda ninguna unión `State`/`LoadState` local para carga de datos.
- [ ] `Loading` y `ErrorAlert` son los únicos bloques de carga/error en las páginas (grep sin duplicados).
- [ ] Suite, typecheck y lint verdes.

## 5. Out of Scope

- Reemplazar las funciones de la capa de datos (`src/lib/*`) — ver candidatos C2/C4.
- Introducir una caché de queries o una librería externa (React Query/SWR).
- Cambiar el diseño visual de carga/error (solo se extrae a un módulo).

## 6. Decisión abierta

- **D1 —** Ubicación del hook: `src/hooks/useAsyncData.ts` (junto a `useScrollReveal`) vs. `src/lib/`. Recomendado: `src/hooks/`.

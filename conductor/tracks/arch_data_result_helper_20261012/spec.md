# Spec — Helper único de `Result`/unwrap + eliminar superficie muerta

> **Track ID:** `arch_data_result_helper_20261012`
> **Fuente:** Revisión de arquitectura del codebase (candidato C4, fuerza **Worth exploring**).
> **Estado:** ⏳ Pendiente (spec + plan; sin implementar).
> **Vocabulario:** `module` / `interface` / `seam` / `locality` / `leverage` (skill `codebase-design`).

---

## 1. Contexto y objetivo

El mismo concepto —"desenvolver un resultado de PostgREST o lanzar"— está implementado **cuatro veces de formas distintas** en la capa de datos:

- `src/lib/briefs.ts:5` declara `type Result<T>`; `:7` `throwOnError`; `:12` `unwrapList`.
- `src/lib/projects.ts:11` declara `type Result<T>` **otra vez**; `:13` `unwrap`; `:19` `unwrapList`.
- `src/lib/clients.ts:23-24,55` y `src/lib/messages.ts:10,19,24` usan el patrón inline `if (…error) throw new Error(…error.message)`.

Hay ~16 ocurrencias de `throw new Error(…error.message)` en 4 archivos. `unwrapList` está definido dos veces (uno es redundante).

Además, `src/lib/clients.ts:53-56` `listClientProfiles` está **muerta** (grep sin callers).

**Objetivo:** un módulo `src/lib/supabase-result.ts` que concentre `Result<T>` y el desenvolvío; migrar los cuatro módulos; borrar `listClientProfiles`.

## 2. Functional Requirements

- **FR1 —** Un único `src/lib/supabase-result.ts` exporta `Result<T>` y las funciones de desenvolvío (registro único y simple, lista, o `maybe`).
- **FR2 —** `clients.ts`, `briefs.ts`, `projects.ts` y `messages.ts` importan el helper y borran sus copias/inline.
- **FR3 —** El mensaje por defecto de "no encontrado" se conserva donde hoy se usa; el helper permite pasar un mensaje.
- **FR4 —** `listClientProfiles` se elimina (sin callers).

## 3. Non-Functional Requirements

- **NFR1 —** El helper se testea en su **interface** (éxito, error con mensaje, lista vacía).
- **NFR2 —** Sin cambio de comportamiento observable en los callers actuales.
- **NFR3 —** `npm run test` / `typecheck` / `lint` verdes; cobertura no baja.

## 4. Acceptance Criteria

- [ ] `Result<T>` y el desenvolvío existen en un solo módulo.
- [ ] No queda `type Result<T>` ni `throwOnError`/`unwrap`/`unwrapList` duplicados (grep).
- [ ] `listClientProfiles` eliminado.
- [ ] Suite, typecheck y lint verdes.

## 5. Out of Scope

- Tipar el error de "no encontrado" para las páginas — ver candidato C2.
- Cambiar la forma de los errores que hoy consumen los callers (solo se centraliza el desenvolvío).
- Profundizar los wrappers de una sola query (shallow, pero su valor real está en el comentario de RLS).

## 6. Decisión abierta

- **D1 —** Firma del helper: `unwrap(result, message?)` + `unwrapList(result)` vs. una única `unwrap(result, { list })`. Recomendado: dos funciones explícitas.

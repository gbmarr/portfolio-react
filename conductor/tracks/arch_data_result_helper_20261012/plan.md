# Plan — Helper único de `Result`/unwrap

> **Track ID:** `arch_data_result_helper_20261012`
> **Spec:** [./spec.md](./spec.md)
> **Status:** ✅ Implementado — pendiente smoke manual (V.4)
> **Reglas:** centralizar el desenvolvío sin cambiar la forma observable de los errores.

---

## Fase T0 — Helper

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T0.1 | `Result<T>` + desenvolvío (`unwrap`, `unwrapList`, `unwrapMaybe`, `throwIfError`) con mensaje configurable | `src/lib/supabase-result.ts` (nuevo) | ✅ |
| T0.2 | Test del helper en su interface (éxito, error, lista vacía, maybe, void) | `src/lib/supabase-result.test.ts` (nuevo) | ✅ |

## Fase T1 — Migrar módulos

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T1.1 | Migrar y borrar `Result`/`unwrap`/`unwrapList` locales | `src/lib/projects.ts` | ✅ |
| T1.2 | Migrar y borrar `Result`/`throwOnError`/`unwrapList` locales | `src/lib/briefs.ts` | ✅ |
| T1.3 | Reemplazar el patrón inline por el helper | `src/lib/clients.ts`, `src/lib/messages.ts` | ✅ |
| T1.4 | Eliminar `listClientProfiles` (sin callers) | `src/lib/clients.ts` | ✅ |

## Fase V — Verificación

| # | Tarea | Herramienta | Estado |
|---|-------|-------------|--------|
| V.1 | `npm run test` (suite verde, cobertura ≥80 %) | Vitest | ✅ |
| V.2 | `npm run typecheck` / `npm run lint` | tsc / ESLint | ✅ |
| V.3 | Grep: sin `Result<T>`/`unwrap`/`throwOnError` duplicados; sin `listClientProfiles` | repo | ✅ |
| V.4 | Smoke manual: listados admin + detalle + portal cliente | manual | ⬜ |
| V.5 | Commit `refactor(arch): helper único Result/unwrap en la capa de datos` + docs del track | git | ✅ |

---

## Decisiones

- **D1 —** Firma del helper: se adoptan **cuatro** funciones explícitas en vez de dos: `unwrap` (registro), `unwrapList` (lista), `unwrapMaybe` (maybe) y `throwIfError` (delete/update sin datos). `unwrapMaybe` reemplaza al `throwOnError` de `briefs.ts`; `throwIfError` elimina el patrón inline de `clients.ts`/`messages.ts`/`projects.ts`.

## Riesgos

| Riesgo | Mitigación |
|--------|-----------|
| Divergencia de mensajes de error entre módulos al centralizar | Se conserva el mensaje por defecto actual (`'No se encontró el registro'`) y se permite override por llamada |
| Dependencia con C2 (agregado) si se toca `projects.ts` | C4 no depende de C2; se puede migrar el desenvolvío primero |

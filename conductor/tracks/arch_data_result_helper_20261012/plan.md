# Plan — Helper único de `Result`/unwrap

> **Track ID:** `arch_data_result_helper_20261012`
> **Spec:** [./spec.md](./spec.md)
> **Status:** ⏳ Pendiente
> **Reglas:** centralizar el desenvolvío sin cambiar la forma observable de los errores.

---

## Fase T0 — Helper

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T0.1 | `Result<T>` + desenvolvío (registro/lista) con mensaje configurable | `src/lib/supabase-result.ts` (nuevo) | ⬜ |
| T0.2 | Test del helper en su interface (éxito, error, lista vacía) | `src/lib/supabase-result.test.ts` (nuevo) | ⬜ |

## Fase T1 — Migrar módulos

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T1.1 | Migrar y borrar `Result`/`unwrap`/`unwrapList` locales | `src/lib/projects.ts` | ⬜ |
| T1.2 | Migrar y borrar `Result`/`throwOnError`/`unwrapList` locales | `src/lib/briefs.ts` | ⬜ |
| T1.3 | Reemplazar el patrón inline por el helper | `src/lib/clients.ts`, `src/lib/messages.ts` | ⬜ |
| T1.4 | Eliminar `listClientProfiles` (sin callers) | `src/lib/clients.ts` | ⬜ |

## Fase V — Verificación

| # | Tarea | Herramienta | Estado |
|---|-------|-------------|--------|
| V.1 | `npm run test` (suite verde, cobertura ≥80 %) | Vitest | ⬜ |
| V.2 | `npm run typecheck` / `npm run lint` | tsc / ESLint | ⬜ |
| V.3 | Grep: sin `Result<T>`/`unwrap`/`throwOnError` duplicados; sin `listClientProfiles` | repo | ⬜ |
| V.4 | Smoke manual: listados admin + detalle + portal cliente | manual | ⬜ |
| V.5 | Commit `refactor(arch): helper único Result/unwrap en la capa de datos` + docs del track | git | ⬜ |

---

## Riesgos

| Riesgo | Mitigación |
|--------|-----------|
| Divergencia de mensajes de error entre módulos al centralizar | Conservar el mensaje por defecto actual y permitir override por llamada |
| Dependencia con C2 (agregado) si se toca `projects.ts` | C4 no depende de C2; se puede migrar el desenvolvío primero |

# Implementation Plan — invite_ux_fix_20261012

**Estado**: ✅ Completado

## Tareas

| # | Tarea | Estado |
|---|-------|--------|
| T1.1 | `src/pages/admin/ClientsPage.tsx`: ajustar el bloque de la columna "Acción" para mostrar siempre una acción (`Invitar` / `Reenviar enlace`) y conservar `Invitación enviada ✓` efímero | ☑️ |
| T1.2 | Actualizar el texto de ayuda de la página (invitar pendientes / reenviar a cuentas ya creadas) | ☑️ |
| V.1 | Tests `ClientsPage.test.tsx`: reemplazar "no muestra botón para clientes ya activos" por pruebas de `Reenviar enlace` (render + llamada a `inviteByMagicLink` + estado ✓) y actualizar el test de distinción | ☑️ |
| V.2 | `npm run test` + `npm run typecheck` + `npm run lint` | ☑️ |
| V.3 | Commit `fix(ux): permitir reenvío de invitación en /admin/clientes` + actualizar `conductor/tracks.md` | ☑️ |

## Riesgos

- **R1 — Regression del test de distinción activos/pendientes:** el render cambia la columna acción para activos; se actualizan las expectativas explícitamente.
- **R2 — Botón "Activar" del MFA vs "Invitar":** sin relación; no se tocan otros componentes.
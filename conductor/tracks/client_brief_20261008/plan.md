# Plan: Brief de proyecto en el panel del cliente

> **Track ID:** `client_brief_20261008`
> **Spec:** [../spec.md](./spec.md)
> **Status:** 📋 Spec y plan aprobados, pendiente de implementación
> **Reglas:** TDD, commits convencionales, build verde en cada commit (ver `conductor/workflow.md`).

---

## Contexto

Cada proyecto nuevo arranca con horas de ida y vuelta recolectando datos básicos. Este track agrega un **checklist interactivo "¿Qué vamos a necesitar?"** en el panel del cliente, derivado del servicio + extras que define el admin. 100% client-side + Supabase RLS (fair-use Hobby: cero serverless, cero email automático, cero uploads en MVP).

**Orden de fases por dependencias:** templates → datos/migración → admin → cliente → docs/verificación.

---

## Fase 0 — Templates del brief

**Objetivo:** catálogo estático de secciones/campos por servicio + extras. **TDD** en la coherencia del catálogo.

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| 0.1 | **TDD:** tests de coherencia — ids de campos únicos por servicio; cada extra tiene sección; kinds válidos; required cubre los campos clave; `briefTemplates` cubre los 3 tiers (rojo) | `src/data/briefTemplates.test.ts` | ⬜ |
| 0.2 | Crear `briefTemplates.ts`: 3 templates (landing/institucional/medida) + `extraSections` para los 7 extras; campo libre "links de Drive/Dropbox" en todos (B2) | `src/data/briefTemplates.ts` | ⬜ |
| 0.3 | Suite verde + `npm run lint` + `npm run typecheck` | — | ⬜ |
| 0.4 | Commit `feat(brief): service templates` | — | ⬜ |

---

## Fase 1 — Datos: types, data layer y migración

**Objetivo:** tabla `project_briefs` + CRUD con RLS. La migración requiere confirmación del usuario antes de aplicarla a la DB.

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| 1.1 | **TDD:** `briefs.test.ts` — getBrief null/brief, upsertBrief crea/actualiza (reset answers si cambia servicio/extras), updateBriefAnswers recalcula status (completado con required cubiertos), listBriefs (rojo) | `src/lib/briefs.test.ts` | ⬜ |
| 1.2 | Tipos `ProjectBrief`/`BriefStatus` en `src/lib/types.ts` (importa `EstimateTierId` de `data/estimate`) | `src/lib/types.ts` | ⬜ |
| 1.3 | Data layer `src/lib/briefs.ts` (getBrief, upsertBrief, updateBriefAnswers, listBriefs; patrón unwrap) | `src/lib/briefs.ts` | ⬜ |
| 1.4 | Migración `0003_client_brief.sql` + aplicar con Supabase CLI (`migration repair` no necesario; push directo) y verificar schema dump | `supabase/migrations/0003_client_brief.sql`, DB | ⬜ |
| 1.5 | Suite verde + typecheck + lint | — | ⬜ |
| 1.6 | Commit `feat(brief): data layer and schema` | — | ⬜ |

---

## Fase 2 — Admin: setup del brief y estado

**Objetivo:** el admin define servicio + extras al crear/editar el proyecto y ve el estado del brief.

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| 2.1 | **TDD:** `ProjectFormPage.test.tsx` — renderiza select Servicio + checkboxes extras; envía serviceType/extraIds al guardar; precarga en edición (rojo) | `src/pages/admin/ProjectFormPage.test.tsx` | ⬜ |
| 2.2 | `ProjectFormPage.tsx`: estado brief {serviceType, extraIds}; guardado integra `upsertBrief` dentro del flujo create/update | `src/pages/admin/ProjectFormPage.tsx` | ⬜ |
| 2.3 | **TDD:** `ProjectDetailPage.test.tsx` — muestra servicio/extras/estado del brief y respuestas (rojo) | `src/pages/admin/ProjectDetailPage.test.tsx` | ⬜ |
| 2.4 | `ProjectDetailPage.tsx`: carga brief con el proyecto; bloque de estado + respuestas | `src/pages/admin/ProjectDetailPage.tsx` | ⬜ |
| 2.5 | **TDD:** `AdminDashboard.test.tsx` — card "Briefs completados / pendientes" (rojo) | `src/pages/admin/AdminDashboard.test.tsx` | ⬜ |
| 2.6 | `AdminDashboard.tsx`: `listBriefs()` + card resumen | `src/pages/admin/AdminDashboard.tsx` | ⬜ |
| 2.7 | Copy `admin.brief.*` en `src/data/panel.ts` | `src/data/panel.ts` | ⬜ |
| 2.8 | Suite verde + typecheck + lint | — | ⬜ |
| 2.9 | Commit `feat(brief): admin setup and status` | — | ⬜ |

---

## Fase 3 — Cliente: sección "¿Qué vamos a necesitar?"

**Objetivo:** el cliente completa el brief desde su panel.

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| 3.1 | **TDD:** `ClientProjectDetailPage.test.tsx` — sección presente con título; renderiza campos según servicio+extras; inputs por kind (color/yesno/textarea); progreso "x de y"; guardar persiste y cambia estado; sin brief → no sección (rojo) | `src/pages/client/ClientProjectDetailPage.test.tsx` | ⬜ |
| 3.2 | `ClientProjectDetailPage.tsx`: carga brief; estado local answers; render de secciones/campos por kind; botón guardar → `updateBriefAnswers`; copy `client.brief.*` | `src/pages/client/ClientProjectDetailPage.tsx`, `src/data/panel.ts` | ⬜ |
| 3.3 | Suite verde + typecheck + lint | — | ⬜ |
| 3.4 | Commit `feat(brief): client brief intake` | — | ⬜ |

---

## Fase 4 — Docs y verificación final

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| 4.1 | Nota en `conductor/servicios.md` (brief como implementación del catálogo) | `conductor/servicios.md` | ⬜ |
| 4.2 | Checklist spec §8 completa (build/lint/test/typecheck/coverage ≥80%, grep, verificación manual con el usuario) | — | ⬜ |
| 4.3 | Actualizar `conductor/tracks.md` + checkboxes de plan.md/spec.md | `conductor/tracks.md`, plan.md, spec.md | ⬜ |
| 4.4 | Commit `docs(conductor): brief implementation notes` + resumen al usuario | — | ⬜ |

---

## Verificación por fase (protocolo `workflow.md`)

Tras cada fase: presentar resumen al usuario para verificación manual antes de marcar `[x]` y pasar a la siguiente. La **Fase 1** (migración a la DB) requiere confirmación explícita del usuario.

## Riesgos

| Riesgo | Mitigación |
|--------|-----------|
| Templates desalineados con el catálogo de servicios | Fuente `conductor/servicios.md` + tests de coherencia (cada extra tiene sección, ids únicos) |
| Status del brief calculado en dos lugares (cliente vs lib) | Función pura compartida `computeBriefStatus` en `briefTemplates.ts`/`briefs.ts`, testeada |
| Cambiar servicio/extras en edición borra respuestas del cliente | Comportamiento deliberado (B4) y documentado en UI admin con warning |
| RLS mal copiada del patrón stages | Revisar política en la migración contra `project_stages`; verificar con dump |
| Arrastrar mucho estado en `ClientProjectDetailPage` | Extraer subcomponentes `BriefSection`/`BriefFieldInput` si crece el render |
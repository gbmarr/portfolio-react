# Plan: Mejoras de panel — brief ágil, plantilla de etapas y cierre de proyecto

> **Track ID:** `panel_ux_20261008`
> **Spec:** [./spec.md](./spec.md)
> **Status:** ✅ Implementado y verificado (2026-10-08) — commits `666283c`, `fcb31b8`, `ba9219a`, `b5e5581`
> **Reglas:** TDD, commits convencionales, build verde en cada commit (ver `conductor/workflow.md`).

---

## Contexto

Cinco mejoras de UX sobre lo ya construido (brief + panel admin/cliente). TDD en cada lógica pura y en cada interacción. Solo la Fase D toca la DB (migración `0004`).

**Orden por dependencias:** brief (A) -> comentario (B) -> plantilla (C) -> finalizar (D) -> docs (E).

---

## Fase A — Brief: cierre y agilidad (E1, E2, E3)

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| A.1 | TDD: tipos/templates — kinds `chips`/`select`, `options`, `hasAnswer`, `computeBriefStatus` multi-valor | `briefTemplates.test.ts` | ✅ |
| A.2 | Implementar `BriefFieldKind`/`BriefField.options`/`hasAnswer` + convertir `objetivo`, `cta_principal`, `tipografia`, `idiomas` | `src/data/briefTemplates.ts` | ✅ |
| A.3 | Tipo `BriefAnswers` y `ProjectBrief.answers` | `src/lib/types.ts` | ✅ |
| A.4 | `updateBriefAnswers` acepta multi-valor | `src/lib/briefs.ts` (+ test) | ✅ |
| A.5 | TDD + implementar chips/select en `BriefFieldInput` | `src/pages/client/ClientBrief.tsx` | ✅ |
| A.6 | TDD + implementar cartel "Brief completado" + "Volver a editar" | `src/pages/client/ClientProjectDetailPage.tsx` (+ test) | ✅ |
| A.7 | Respuestas array unidas por coma en el admin | `src/pages/admin/ProjectDetailPage.tsx` (+ test) | ✅ |
| A.8 | Copy nuevo (`panelCopy.client.brief.*`) | `src/data/panel.ts` | ✅ |
| A.9 | Suite + typecheck + lint + build | — | ✅ |
| A.10 | Commit `feat(brief): completed state and chip/select fields` | — | ✅ |

---

## Fase B — Comentario del cliente visible

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| B.1 | TDD: renderiza `approval.comment` como blockquote | `src/pages/admin/StageEditor.test.tsx` | ✅ |
| B.2 | Implementar blockquote del comentario | `src/pages/admin/StageEditor.tsx` | ✅ |
| B.3 | Suite + commit `feat(admin): show client milestone comments` | — | ✅ |

---

## Fase C — Plantilla de etapas (E4)

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| C.1 | TDD: `getStageTemplate` (base + tier + extras, orden) | `src/data/stageTemplates.test.ts` | ✅ |
| C.2 | Implementar `src/data/stageTemplates.ts` | datos | ✅ |
| C.3 | TDD: botón "Agregar etapas sugeridas" (agrega solo faltantes) | `ProjectDetailPage.test.tsx` | ✅ |
| C.4 | Implementar panel + handler en el detalle | `src/pages/admin/ProjectDetailPage.tsx` | ✅ |
| C.5 | Suite + commit `feat(admin): suggested stage template` | — | ✅ |

---

## Fase D — Finalizar proyecto + card de logro (E5)

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| D.1 | Migración `0004_project_completion.sql` (columna + trigger) | `supabase/migrations/` | ✅ |
| D.2 | Aplicar (`supabase db push --yes`) y verificar schema | DB | ✅ |
| D.3 | `Project.completed_at` + `ProjectInput` lo omite | `src/lib/types.ts` | ✅ |
| D.4 | TDD + implementar botón Finalizar/Reabrir + fecha | `src/pages/admin/ProjectDetailPage.tsx` (+ test) | ✅ |
| D.5 | TDD + implementar card "Proyecto terminado" | `src/pages/client/ClientProjectDetailPage.tsx` (+ test) | ✅ |
| D.6 | Copy nuevo | `src/data/panel.ts` | ✅ |
| D.7 | Suite + commit `feat(projects): completion state and client achievement` | — | ✅ |

---

## Fase E — Docs + verificación final

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| E.1 | Notas en `conductor/servicios.md` (plantilla de etapas) | `servicios.md` | ✅ |
| E.2 | Checklist final: build, lint, test, typecheck, coverage ≥80% | — | ✅ |
| E.3 | Actualizar estado del track en `tracks.md` + checkboxes | `tracks.md`, `plan.md` | ✅ |
| E.4 | Commit docs + resumen al usuario | — | ✅ |

---

## Verificación por fase (protocolo `workflow.md`)

Tras cada fase: resumen al usuario para verificación manual antes de marcar `[x]` y pasar a la siguiente. La **Fase D** requiere confirmación del usuario para aplicar la migración.

## Riesgos

| Riesgo | Mitigación |
|--------|-----------|
| Cambiar `answers` a multi-valor rompe tests/render existentes | Cambiar el tipo primero y ajustar tests junto (mismo commit) |
| Instalar la plantilla de etapas duplica etapas ya creadas | Comparación por nombre normalizado (`trim().toLowerCase()`) |
| Trigger de `completed_at` dispara en updates que no cambian el estado | Condición `old.status is distinct from new.status` |
| `ProjectInput` arrastra `completed_at` al formulario | Excluirlo explícitamente del `Omit` |

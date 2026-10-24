# Plan — Preview de avance del proyecto

> **Track ID:** `project_preview_20261024`
> **Spec:** [./spec.md](./spec.md)
> **Estado:** Implementado; pendiente migración + smoke manual.
> **Reglas:** TDD, sin serverless nuevo, sin montos, sin iframe.

---

## Fase T0 — Datos y Storage

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T0.1 | Columnas `preview_url`/`preview_label` con CHECK de HTTPS y largo | `supabase/migrations/0017_project_previews.sql` | Hecho |
| T0.2 | Tabla `project_previews` + índices + RLS admin/cliente | idem | Hecho |
| T0.3 | Bucket privado + policies de `storage.objects` | idem | Hecho |
| T0.4 | Tipos `ProjectPreview` / `ProjectPreviewWithUrl` | `src/lib/types.ts` | Hecho |
| T0.5 | Tests de validación/path/listado/subida/borrado | `src/lib/previews.test.ts` | Hecho |

## Fase T1 — Capa de datos

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T1.1 | `listProjectPreviews` con signed URLs | `src/lib/previews.ts` | Hecho |
| T1.2 | `uploadProjectPreview` con rollback del objeto | idem | Hecho |
| T1.3 | `updateProjectPreview` / `deleteProjectPreview` | idem | Hecho |
| T1.4 | Incluir `previews` en `ProjectDetail` | `src/lib/projects.ts` | Hecho |

## Fase T2 — UI admin

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T2.1 | Formulario de enlace externo + etiqueta | `src/pages/admin/ProjectPreviewManager.tsx` | Hecho |
| T2.2 | Upload con etapa, epígrafe y visibilidad | idem | Hecho |
| T2.3 | Galería admin con eliminar/visibilidad | idem | Hecho |
| T2.4 | Integrar en el detalle del proyecto | `src/pages/admin/ProjectDetailPage.tsx` | Hecho |
| T2.5 | Copy del panel | `src/data/panel.ts` | Hecho |
| T2.6 | Tests de componente | `src/pages/admin/ProjectPreviewManager.test.tsx` | Hecho |

## Fase T3 — UI cliente

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T3.1 | Galería cliente + botón de enlace externo | `src/pages/client/ProjectPreviewGallery.tsx` | Hecho |
| T3.2 | Integrar en el detalle del cliente | `src/pages/client/ClientProjectDetailPage.tsx` | Hecho |
| T3.3 | Ocultar sección si no hay contenido | idem | Hecho |
| T3.4 | Tests de componente | `src/pages/client/ProjectPreviewGallery.test.tsx` | Hecho |

## Fase T4 — Seguridad y headers

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T4.1 | Agregar host Supabase a `img-src` | `vercel.json`, `netlify.toml` | Hecho |
| T4.2 | Test de regresión de CSP | `src/headersConfig.test.ts` | Hecho |

## Fase V — Verificación

| # | Tarea | Herramienta | Estado |
|---|-------|-------------|--------|
| V.1 | `npm run test` | Vitest | Hecho |
| V.2 | `npm run typecheck` / `npm run lint` | tsc / ESLint | Hecho |
| V.3 | `npm run build` | Vite | Hecho |
| V.4 | Aplicar `0017` y smoke manual con imagen real | Supabase + navegador | Pendiente owner |

---

## Riesgos

| Riesgo | Mitigación |
|--------|------------|
| La policy de Storage no permite `createSignedUrl` | Se prueba en smoke; si falla, se ajusta la policy con la misma condición de ownership. |
| Un archivo huérfano si falla el insert | Rollback explícito del objeto en `uploadProjectPreview`. |
| URL externa maliciosa (`javascript:`) | Normalización a HTTPS + CHECK en DB. |
| Imágenes grandes o formato no soportado | Validación de MIME/tamaño antes de subir. |

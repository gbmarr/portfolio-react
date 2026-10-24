# Spec — Preview de avance del proyecto

> **Track ID:** `project_preview_20261024`
> **Fuente:** Pedido del owner (2026-10-24).
> **Estado:** Implementado (código + tests); pendiente aplicar migración y smoke manual.

---

## 1. Contexto y objetivo

Hoy el cliente ve el avance solo como una lista de etapas con estados y aprobaciones. No puede ver cómo se está viendo el sitio ni abrir un entorno de preview. El admin tampoco tiene un lugar en el panel para publicar capturas del avance.

**Objetivo:** dar al admin una forma simple de publicar capturas del avance (y un enlace externo opcional) y al cliente una galería visual dentro de `/panel/:id`, sin agregar serverless, sin iframe y sin gestión de pagos.

## 2. Functional Requirements

- **FR1 — Galería por proyecto:** el admin puede subir imágenes al bucket privado `project-previews`, asociarlas opcionalmente a una etapa, agregarles un epígrafe y decidir si son visibles para el cliente.
- **FR2 — Gestión:** el admin puede eliminar una captura (objeto de Storage + fila) y cambiar su visibilidad/epígrafe.
- **FR3 — Enlace externo:** el admin puede guardar una URL HTTPS de preview (staging, Figma, etc.) y una etiqueta; el cliente la ve como botón “Abrir preview” en una pestaña nueva.
- **FR4 — Vista del cliente:** el cliente ve solo capturas `client_visible = true` de sus proyectos y el enlace externo si existe. Cada captura muestra imagen, epígrafe y etapa asociada.
- **FR5 — RLS:** un cliente no puede leer filas ni objetos de Storage de otro cliente. Un usuario anónimo no puede leer ni escribir previews.
- **FR6 — Integridad:** al eliminar un proyecto se eliminan sus filas de preview; al eliminar una etapa, la captura queda sin etapa (`set null`).

## 3. Non-Functional Requirements

- **NFR1 — Fair-use:** sin Edge Functions nuevas, sin cobros y sin procesar pagos. Solo Supabase Storage + Postgres/RLS.
- **NFR2 — Seguridad:** bucket privado; URLs firmadas con expiración; validación de MIME y tamaño en cliente; `preview_url` solo `https://`; CSP `img-src` acotada al host exacto de Supabase.
- **NFR3 — UX:** reutilizar el design system existente (`portfolio-design`), estados de carga/error, textos en español y accesibilidad básica (`aria-label`, `alt`, foco visible).
- **NFR4 — Rendimiento:** imágenes con `loading="lazy"` y `decoding="async"`; lista acotada por proyecto.
- **NFR5 — Calidad:** TDD, suite/typecheck/lint/build verdes y cobertura ≥80%.

## 4. Acceptance Criteria

- [x] Migración `0017_project_previews.sql` con columnas, tabla, índices, RLS, bucket y policies.
- [x] `src/lib/previews.ts` con validación, path, listado con signed URLs, subida con rollback, actualización y borrado.
- [x] `Project` incluye `preview_url`/`preview_label`; el detalle incluye `previews`.
- [x] El admin gestiona enlace y galería desde el detalle del proyecto.
- [x] El cliente ve la galería y el enlace solo cuando corresponde.
- [x] CSP actualizada en `vercel.json` y `netlify.toml` + test de regresión.
- [x] Tests unitarios y de componentes agregados.
- [ ] Migración aplicada en Supabase por el owner.
- [ ] Smoke manual admin/cliente con un archivo real.

## 5. Out of Scope

- Contratos, firma y propuestas (stand-by explícito del owner).
- iframe embebido de staging: requiere `frame-src`, proteger el entorno y resolver autenticación; se usa enlace externo.
- Múltiples archivos por captura, video, drag-and-drop, ordenamiento manual y borrado masivo.
- Notificaciones automáticas al cliente cuando hay una captura nueva.
- Redimensionado/optimización de imágenes server-side.

## 6. Decisiones

- **D1 — Enfoque:** galería de capturas + enlace externo opcional. No iframe en el MVP.
- **D2 — Storage:** bucket privado `project-previews`, path `{project_id}/{uuid}.{ext}`, signed URL TTL 1 hora.
- **D3 — Visibilidad:** `client_visible` por captura, igual que las etapas. El enlace externo se muestra si existe.
- **D4 — Datos:** `projects.preview_url`/`preview_label` para el enlace y `project_previews` para las capturas.
- **D5 — Límites:** 5 MB por imagen; JPEG, PNG, WebP o AVIF.

# Spec — Mejoras de panel: brief ágil, plantilla de etapas y cierre de proyecto

> **Track ID:** `panel_ux_20261008`
> **Fuente:** decisiones confirmadas con el usuario el 2026-10-08.
> **Estado:** Aprobado por el usuario (spec + plan).

---

## 1. Contexto y objetivo

Tras el track `client_brief_20261008`, el brief del cliente funciona pero puede ser más ágil (campos largos para preguntas con respuestas típicas) y el panel admin carece de dos atajos: reutilizar etapas y cerrar un proyecto. Además, el comentario que el cliente deja al aprobar/rechazar una etapa no es visible para el admin.

Este track agrupa **5 mejoras**:

1. Ocultar el brief cuando está completado (con opción de reeditarlo).
2. Brief más ágil: chips multi-opción en `objetivo`, `cta_principal` e `idiomas`; select de tipografías populares.
3. Mostrar en el panel admin el comentario del cliente en cada etapa.
4. Plantilla de etapas por servicio + extras, para no crearlas a mano.
5. Botón "finalizar proyecto" (reversible, sin tocar etapas) + card de logro en la vista del cliente.

Todo es **client-side** salvo la Fase D (una migración que agrega `projects.completed_at`). Guardrail fair-use intacto: cero serverless/functions.

---

## 2. Decisiones confirmadas (2026-10-08)

| # | Tema | Decisión |
|---|------|----------|
| E1 | Brief completado | Al completarse, el cliente ve un **cartel "Brief completado"** + link **"Volver a editar"** que reabre el formulario. |
| E2 | Chips | `objetivo`, `cta_principal` e `idiomas` pasan a **chips** (opciones típicas + agregar opción propia). |
| E3 | Tipografía | `tipografia` pasa a **select** con fuentes populares + opción "Otra". |
| E4 | Plantilla de etapas | Botón en el detalle que **agrega solo las etapas sugeridas que faltan** (comparación por nombre). |
| E5 | Finalizar proyecto | Botón **reversible**, **no toca las etapas**, registra la fecha (`completed_at`). |

---

## 3. Alcance — Fase A: Brief, cierre y agilidad (E1, E2, E3)

### 3.1 Respuestas multi-valor

`ProjectBrief.answers` pasa de `Record<string, string>` a **`Record<string, string | string[]>`** (la columna DB ya es `jsonb`; no requiere migración).

- Se exporta `BriefAnswers = Record<string, string | string[]>` en `src/lib/types.ts`.
- Helper `hasAnswer(value)` en `briefTemplates.ts`: `true` si es string con `trim().length > 0` o array con al menos un elemento no vacío.
- `computeBriefStatus` usa `hasAnswer` para los campos `required`.

### 3.2 Tipos y templates

- `BriefFieldKind` suma `'chips'` y `'select'`.
- `BriefField` suma `options?: string[]` (para `chips` y `select`).
- Cambios de campos:
  - `objetivo`: `longtext` -> **`chips`**, `options`: `['Conseguir más clientes', 'Mostrar mis servicios', 'Vender online', 'Recibir consultas', 'Generar confianza', 'Posicionar mi marca']`. Sigue `required`.
  - `cta_principal`: `text` -> **`chips`**, `options`: `['Escribir por WhatsApp', 'Llamar', 'Completar formulario', 'Comprar', 'Pedir turno', 'Reservar', 'Suscribirse', 'Ver el catálogo']`. Sigue `required`.
  - `tipografia`: `text` -> **`select`**, `options`: `['Inter', 'Montserrat', 'Poppins', 'Roboto', 'Lato', 'Raleway', 'Playfair Display', 'Oswald', 'Nunito', 'Merriweather']` + opción "Otra" que revela un input de texto. No `required`.
  - `idiomas` (extra multidioma): `text` -> **`chips`**, `options`: `['Español', 'Inglés', 'Portugués', 'Francés', 'Italiano', 'Alemán']`. Sigue `required`.

### 3.3 UI del cliente — `ClientBrief.tsx`

- Estado `answers` con el tipo multi-valor.
- `BriefFieldInput` soporta los kinds nuevos:
  - `chips`: botones toggle (selección múltiple) + input "Agregar otra" que suma un valor propio.
  - `select`: `SelectField` con las `options` + opción "Otra" -> input de texto libre (el valor guardado es el texto).
- El botón Guardar persiste el objeto completo (strings y arrays).

### 3.4 Cierre en `ClientProjectDetailPage.tsx`

- Si `brief.status === 'completado'` y el cliente **no** pidió reabrir -> cartel **"Brief completado"** + botón **"Volver a editar"**.
- Al pulsar "Volver a editar" se muestra el formulario `ClientBrief` normal.
- Si el brief está `pendiente`, se muestra el formulario directamente (comportamiento actual).

### 3.5 Admin — `ProjectDetailPage.tsx`

- En el detalle del brief, los valores array se muestran unidos por `", "`.

---

## 4. Alcance — Fase B: Comentario del cliente visible

En `src/pages/admin/StageEditor.tsx`, bajo cada etapa con `approval`, renderizar el **comentario** (`approval.comment`) como `blockquote`, con el mismo tratamiento visual del panel del cliente. Si no hay comentario, no se muestra nada.

---

## 5. Alcance — Fase C: Plantilla de etapas (E4)

### 5.1 Datos — `src/data/stageTemplates.ts` (nuevo)

`getStageTemplate(serviceType: EstimateTierId, extraIds: string[]): string[]` devuelve nombres de etapas sugeridas, ordenadas, derivadas de `process.ts` y `servicios.md`:

- **Base:** `Relevamiento del brief`, `Propuesta de diseño`, `Desarrollo`, `Revisión del cliente`, `Ajustes finales`, `Publicación`.
- **Institucional (suma):** `Contenido de secciones`.
- **Medida (suma):** `Definición funcional`, `Arquitectura y base de datos`, `Desarrollo de funcionalidades`, `Integraciones`, `Pruebas`.
- **Por extra (suma):** blog -> `Configuración del blog/CMS`; integraciones -> `Conexión de servicios externos`; multidioma -> `Traducción de contenidos`; logo -> `Diseño de logo e identidad`; copy -> `Redacción de textos`; ecommerce -> `Configuración de la tienda`; seo -> `SEO técnico y analytics`.

Las etapas de extras se insertan antes de la última (`Publicación`) para que esta quede al final.

### 5.2 Admin — `ProjectDetailPage.tsx`

- Botón **"Agregar etapas sugeridas"** junto a la sección de etapas.
- Calcula el template desde el `brief` (servicio + extras). Sin brief -> hint y botón deshabilitado.
- Compara por nombre (trim + case-insensitive) y crea **solo las que faltan**, al final, con `createStage` (status `pendiente`, `client_visible: true`).
- Mensaje de resultado ("Se agregaron N etapas" / "No había etapas nuevas para agregar").

---

## 6. Alcance — Fase D: Finalizar proyecto + card de logro (E5)

### 6.1 Migración `0004_project_completion.sql`

- `alter table public.projects add column if not exists completed_at timestamptz;`
- Trigger `projects_completed_at`: al pasar `status` a `'completado'` setea `completed_at = now()`; al salir lo limpia (`null`). Cubre botón y formulario.
- RLS sin cambios.

### 6.2 Tipos

- `Project` suma `completed_at: string | null`.
- `ProjectInput` lo **omite**: `Omit<Project, 'id' | 'created_at' | 'updated_at' | 'completed_at'>`.

### 6.3 Admin — `ProjectDetailPage.tsx`

- Botón **"Finalizar proyecto"** en el header (si `status !== 'completado'`) -> `updateProject(id, { status: 'completado' })`.
- Si está `completado`: muestra la **fecha** y botón **"Reabrir"** -> `updateProject(id, { status: 'en_progreso' })`.
- No modifica etapas.

### 6.4 Cliente — `ClientProjectDetailPage.tsx`

- Si `project.status === 'completado'`, card destacada **"Proyecto terminado"** bajo el header, con la fecha (`completed_at`) y un mensaje breve. Sin emojis (estilo del sitio).

---

## 7. Fuera de alcance

- Subida de archivos (Supabase Storage) — track aparte.
- Email automático (requiere Pro / serverless).
- Cambios en el estimador, precios o superficies públicas.
- Reordenar etapas según la plantilla (el admin ajusta a mano).

---

## 8. Criterios de aceptación

- [ ] Brief completado se oculta tras un cartel y se puede reabrir.
- [ ] `objetivo`, `cta_principal` e `idiomas` son chips (con opción propia); `tipografia` es select con "Otra".
- [ ] Los arrays se guardan, se muestran en el admin (unidos por coma) y cuentan para el estado del brief.
- [ ] El admin ve el comentario del cliente en cada etapa que tenga uno.
- [ ] El botón "Agregar etapas sugeridas" crea solo las faltantes según el brief.
- [ ] "Finalizar proyecto" registra `completed_at`, es reversible y no toca etapas; el cliente ve la card de logro.
- [ ] `npm run build`, `lint`, `test`, `typecheck` en verde; coverage ≥80%.
- [ ] Migración `0004` aplicada y verificada.

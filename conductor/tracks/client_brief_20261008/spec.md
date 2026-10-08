# Spec — Brief de proyecto en el panel del cliente

> **Track ID:** `client_brief_20261008`
> **Fuente:** decisión confirmada con el usuario el 2026-10-08.
> **Estado:** ✅ Aprobado por el usuario (spec + plan).

---

## 1. Contexto y objetivo

Cada nuevo proyecto arranca con horas de ida y vuelta por WhatsApp/email recolectando información básica: identidad de marca, colores, textos, imágenes, referencias. Ese trabajo es repetitivo y se puede automatizar *educando* al cliente con un checklist.

La idea: por cada proyecto, el panel del cliente muestra una sección **"¿Qué vamos a necesitar?"** con los datos que el cliente debe proveer según el servicio contratado (y los extras elegidos). El admin define servicio + extras al crear/editar el proyecto; el cliente completa campos (colores, tipografía, logo, textos, URLs…) desde su panel; el estado se auto-calculó (pendiente/completado) y el admin ve un contador en su dashboard.

**Regla de oro:** todo 100% client-side + Supabase (RLS). Cero serverless (fair-use Hobby, ver `conductor/fair-use.md`).

---

## 2. Decisiones confirmadas (2026-10-08)

| # | Tema | Decisión |
|---|------|----------|
| B1 | Alcance | **Solo en el panel del cliente** (`ClientProjectDetailPage`). Sin páginas públicas por servicio. |
| B2 | Archivos | **Sin subida de archivos en el MVP.** Campos texto/color/tipografía/URL + un campo libre para links de Drive/Dropbox. Upload a Supabase Storage queda como follow-up. |
| B3 | Aviso al admin | Estado del brief (pendiente/completado) visible en admin + **contador "Briefs completados / pendientes"** en AdminDashboard. **Sin email automático** (requeriría serverless, vedado). |
| B4 | Qué define el brief | **Servicio (tiers del estimador)** + **extras (checkboxes)**. Campo nuevo, NO se reutiliza `projects.type`. |

---

## 3. Templates estáticos — `src/data/briefTemplates.ts`

Catálogo de requerimientos agrupados en **secciones**, keyed por `EstimateTierId` más secciones condicionales por extra.

```ts
type BriefFieldKind = 'text' | 'color' | 'url' | 'longtext' | 'yesno'

interface BriefField {
  id: string            // único dentro del template
  label: string
  hint?: string
  kind: BriefFieldKind
  required: boolean
}

interface BriefSection {
  id: string
  title: string
  fields: BriefField[]
}

interface BriefTemplate {
  serviceType: EstimateTierId   // 'landing' | 'institucional' | 'medida'
  sections: BriefSection[]
  extraSections: Partial<Record<string, BriefSection>>  // keyed por extra id
}

export const briefTemplates: Record<EstimateTierId, BriefTemplate>
```

### Contenido por servicio (derivado de `conductor/servicios.md`)

- **Landing** (`landing`): Datos del negocio · Objetivo y CTA principal · Identidad (colores hex, tipografía, logo: lo tiene o a diseñar, fotos/URLs) · Referencias que le gusten.
- **Institucional** (`institucional`): lo de landing + Secciones del sitio (cuáles y qué va en cada una) · Historia/equipo · Contacto.
- **Medida** (`medida`): lo de institucional + Proceso de negocio/venta · Catálogo (cantidad de ítems, precios provistos) · Cobro (cuenta Mercado Pago) · Usuarios/roles (si es app).

### Secciones por extra (condicionales)

| Extra | Sección que agrega |
|-------|--------------------|
| `blog` | Contenidos: ¿los provee el cliente o redactamos? ¿quién actualiza? |
| `integraciones` | Listar sistemas a integrar (Mercado Pago, CRM, etc.) |
| `multidioma` | Idiomas a soportar; ¿traducciones provistas? |
| `logo` | ¿Trae archivo/URL o lo diseñamos? Descripción de marca |
| `copy` | ¿Textos provistos o redactamos? Tono/brand voice |
| `ecommerce` | Catálogo, envíos, forma de cobro |
| `seo` | Dominio, cuenta de Google Search Console/Analytics |

---

## 4. Datos

### 4.1 Migración `supabase/migrations/0003_client_brief.sql`

```sql
create table public.project_briefs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null unique references public.projects (id) on delete cascade,
  service_type text not null check (service_type in ('landing','institucional','medida')),
  extra_ids jsonb not null default '[]',
  answers jsonb not null default '{}',          -- { fieldId: value }
  status text not null default 'pendiente' check (status in ('pendiente','completado')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

- RLS idéntica al patrón de `project_stages`: el cliente lee/actualiza el brief de sus proyectos (join `projects` por `lower(email) = client_email`); el admin puede todo. Reutiliza el trigger `set_updated_at`.
- **Sin archivos**: `answers` guarda strings/booleanos. Links de Drive/Dropbox van como texto normal (B2).

### 4.2 Tipos — `src/lib/types.ts`

```ts
export type BriefStatus = 'pendiente' | 'completado'
export interface ProjectBrief {
  id: string
  project_id: string
  service_type: EstimateTierId
  extra_ids: string[]
  answers: Record<string, string>
  status: BriefStatus
  created_at: string
  updated_at: string
}
```

### 4.3 Data layer — `src/lib/briefs.ts`

- `getBrief(projectId)` → brief o null (unwrap).
- `upsertBrief(projectId, serviceType, extraIds)` → crea o actualiza; **si cambia serviceType/extraIds, resetea `answers` y vuelve a `pendiente`**.
- `updateBriefAnswers(projectId, answers)` → actualiza respuestas y **recalcula status** (completado si todos los `required` del template vigente están respondidos).
- `listBriefs()` → todos los briefs (para el dashboard admin).

---

## 5. Flujo

1. **Admin — `ProjectFormPage`**: al crear/editar proyecto, select **"Servicio"** (labels de `estimateTiers`) + checkboxes **"Extras opcionales"** (labels de `estimateExtras`). Al guardar: `upsertBrief` (si cambia servicio/extras en edición, se resetean `answers` y pasa a pendiente).
2. **Admin — `ProjectDetailPage`**: badge con servicio + extras + estado del brief; lista de respuestas provistas.
3. **Admin — `AdminDashboard`**: card "Briefs completados / pendientes" vía `listBriefs()`.
4. **Cliente — `ClientProjectDetailPage`**: nueva sección **"¿Qué vamos a necesitar?"** bajo el header: template del servicio + secciones de extras; inputs por `kind` (text, color → `input type=color`, url, longtext → textarea, yesno → toggle); botón guardar; progreso "x de y campos obligatorios"; status auto-calculado al guardar.

---

## 6. Archivos a tocar

| Tipo | Archivo |
|------|---------|
| + | `src/data/briefTemplates.ts` (+ `.test.ts`) |
| + | `src/lib/briefs.ts` (+ `.test.ts`) |
| + | `supabase/migrations/0003_client_brief.sql` |
| ~ | `src/lib/types.ts` (`ProjectBrief`, `BriefStatus`) |
| ~ | `src/pages/admin/ProjectFormPage.tsx` (+ test) |
| ~ | `src/pages/admin/ProjectDetailPage.tsx` (+ test) |
| ~ | `src/pages/admin/AdminDashboard.tsx` (+ test) |
| ~ | `src/pages/client/ClientProjectDetailPage.tsx` (+ test) |
| ~ | `src/data/panel.ts` (copy `client.brief.*`, `admin.brief.*`) |

---

## 7. Fuera de alcance

- Subida de archivos / Supabase Storage (follow-up).
- Email automático o notificaciones push (serverless vedado).
- Páginas públicas por servicio.
- Reusar `projects.type` como fuente del brief (B4).
- Cambios en el estimador, Navbar o secciones públicas.

---

## 8. Criterios de aceptación

- [x] El cliente ve "¿Qué vamos a necesitar?" solo en sus proyectos, con los campos del servicio + extras que eligió el admin.
- [x] Guardar persiste vía RLS y el status se auto-calcula (completado = todos los obligatorios respondidos).
- [x] El admin ve contador "Briefs completados / pendientes" en el dashboard.
- [x] Sin archivos subidos, sin email automático, sin serverless (fair-use intacto).
- [x] Superficies públicas intactas; `/panel/*` ya noindex.
- [x] `npm run build`, `lint`, `test`, `typecheck` en verde; cobertura ≥80% (94.97% statements / 87.51% branches).
- [x] Migración `0003` aplicada y verificada en la DB.
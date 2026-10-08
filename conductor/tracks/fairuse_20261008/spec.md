# Spec — Fair-use Vercel Hobby, acceso de clientes y estimador de presupuesto

> **Track ID:** `fairuse_20261008`
> **Fuente:** decisiones confirmadas con el usuario el 2026-10-08.
> **Estado:** ✅ Aprobado por el usuario (spec + plan).

---

## 1. Contexto y objetivo

El sitio se despliega en el **plan Hobby de Vercel** (uso personal, no comercial) y el usuario decidió mantenerse temporalmente en ese plan. Se definen tres frentes:

1. **Estrategia fair-use:** eliminar del producto toda gestión de cobros/monetización desplegada en Vercel, manteniendo el panel como herramienta de *gestión de proyectos*. Dejar por escrito los guardrails para no recaer.
2. **Acceso de clientes:** hacer visible el login de clientes de forma discreta (footer) y evitar la indexación de rutas privadas.
3. **Estimador de presupuesto:** sección pública que da un rango orientativo de precio en vivo y deriva a WhatsApp — funciona 100% client-side (cero functions, alineado con fair-use).

---

## 2. Decisiones confirmadas (2026-10-08)

| # | Tema | Decisión |
|---|------|----------|
| D1 | Limpieza monetaria | **UI + código + migración DROP**: se elimina la tabla `payments` y las columnas `projects.amount/currency` con respaldo CSV previo. |
| D2 | Login | Enlace discreto **"Acceso clientes" en el footer** → `/login`. `/acceso-admin` **sigue oculto** (no se enlaza en ningún lado). |
| D3 | Noindex | Rutas `/login`, `/acceso-admin`, `/admin/*`, `/panel/*` con `X-Robots-Tag: noindex` (headers) + meta robots runtime. **Sin** `Disallow` en robots.txt (impediría ver el noindex). |
| D4 | Estimador | **Sección propia `#estimador`** entre FAQ y CTAFinal, 100% client-side. |
| D5 | Moneda | Rango en **USD + aproximación en ARS** con cotización editable en `src/data/estimate.ts`. |
| D6 | Tercer tier | Agregar **"E-commerce o proyecto a medida"** (base USD 1.200) al estimador (solo dentro del estimador, no como card pública). |
| D7 | Extras | Modelo **enriquecido: 7 extras con precio + 1 chip informativo** (ver §5). |
| D8 | Urgencia | Toggle exprés ≤1 semana → **multiplicador ×1.3**. |
| D9 | Copy público | **No se toca**: FAQ de pagos (50/50), CTAs "Pedí tu presupuesto", proceso. Es marketing, no operación transaccional. |
| D10 | Precios "desde" | Restaurar precio "desde" por servicio en `ServiceCard` (USD 250 / USD 450), fuente única en `services.ts`. |

---

## 3. Alcance — Estrategia fair-use (D1, D9)

### 3.1 Qué es el problema

La fair-use de Vercel restringe Hobby a *uso personal no comercial*. Un panel de administración que **gestiona cobros** (señas, saldos, montos ARS/USD, estados de pago) sobre el mismo deployment es la evidencia más clara de operación de negocio en hosting personal. La política aplica al **uso de la plataforma**, no al texto promocional: los CTAs y el FAQ de formas de pago se mantienen (D9).

### 3.2 Cambios de producto (eliminar TODO lo monetario)

| Área | Qué se elimina |
|------|----------------|
| Admin dashboard | Sección "Finanzas" (4 StatCards Cobrado/Pendiente ARS/USD), carga de `listAllPayments`, campo `totals` de KPIs |
| Admin proyectos | Columna "Monto" en la lista; campo "Monto" + select "Moneda" en el formulario (y su validación); fila "Monto" en el detalle |
| Admin detalle | `PaymentsPanel` completo (lista, alta, marcar pagado, borrar, totales) |
| Panel cliente | Sección "Pagos" de `ClientProjectDetailPage` (lista, badges, totales por moneda) y `computePaymentTotals` |
| Data layer | CRUD de pagos en `lib/projects.ts` (`listPayments`, `listAllPayments`, `createPayment`, `updatePayment`, `deletePayment`) |
| Tipos | `Payment`, `PaymentInput`, `PaymentKind`, `PaymentStatus`, `Project.amount`, `Project.currency`, `ProjectInput` en `lib/types.ts` |
| Copy | Bloques de pagos en `src/data/panel.ts` (`client.payments`, `paidLabel/pendingLabel`, `statusLabels.payment`, `statusTones.payment`, `paymentKind`) |
| DB | **Migración `0002_drop_billing.sql`**: `DROP TABLE payments;` + `ALTER TABLE projects DROP COLUMN amount, DROP COLUMN currency;` |

**Se conserva:** `formatMoney` en `lib/format.ts` (lo reutiliza el estimador), tipo `Currency`, tablas `project_stages`, `milestone_approvals`, `contact_messages`, `profiles`, RLS restantes, todo el panel de gestión (proyectos, etapas/timeline, aprobaciones, clientes, mensajes, passkeys, KPIs no monetarios).

### 3.3 Respaldo previo (obligatorio antes de la migración)

1. Exportar `payments` y `projects (id, title, amount, currency)` a CSV en `supabase/backups/2026-10-08_billing/`.
2. Agregar `supabase/backups/` a `.gitignore` (datos de clientes, no se versionan).
3. Verificar conteo de filas exportadas == conteo en DB antes de correr la migración.

### 3.4 Guardrails documentados

Crear `conductor/fair-use.md` (enlazado desde `conductor/index.md`) con:
- Límites Hobby vigentes (100 GB transfer, 1M invocations, 0 functions hoy; 6.000 build-min).
- Reglas: **nunca** crear `/api` ni serverless functions para operación del negocio; **nunca** procesar pagos/transactions vía este deployment; el estimador y toda lógica de precio es client-side; el panel es *project management*, no billing.
- Señales de que toca migrar a Pro: cobrar por el sitio, agregar funciones transaccionales, exceder límites.
- Anti-patrones a revisar en cada code review.

---

## 4. Alcance — Acceso de clientes y noindex (D2, D3)

### 4.1 Footer
- `src/components/Footer.tsx`: agregar `<nav>` con link discreto **"Acceso clientes"** → `/login` (react-router `Link`).
- Copy nuevo en `copy.footer.clientAccess`. Sin cambios en Navbar (sigue solo anclas).

### 4.2 Noindex de rutas privadas
- `vercel.json` → `headers`: `X-Robots-Tag: noindex` para fuentes `/login`, `/acceso-admin`, `/admin/:path*`, `/panel/:path*`.
- `netlify.toml`: mismos headers (paridad de deploy).
- Runtime SPA: helper `applyRobotsMeta(indexable: boolean)` en `src/utils/seo.ts` + componente/efecto en `AppRouter` que setea `<meta name="robots" content="noindex">` en rutas privadas y lo limpia en públicas.
- `public/robots.txt`: **sin cambios** (no agregar Disallow).

---

## 5. Alcance — Estimador de presupuesto (D4–D8)

### 5.1 Modelo de datos — `src/data/estimate.ts` (fuente única)

**Tiers:**

| id | Nombre | Base USD | Alcance | Timeline |
|----|--------|----------|---------|----------|
| `landing` | Landing page | 250 (lee de `services.priceFromUsd`) | fijo (1 página) | 1 a 2 semanas |
| `institucional` | Sitio institucional | 450 (lee de `services.priceFromUsd`) | 3 secciones base, slider 3–8, **+USD 80** por sección extra | 2 a 4 semanas |
| `medida` | E-commerce o proyecto a medida | 1.200 (constante local) | fijo | 4 a 8 semanas |

**Extras (checkbox):**

| id | Label | Valor |
|----|-------|-------|
| `blog` | Blog / CMS editable | +USD 150 |
| `integraciones` | Formularios e integraciones (APIs, Mercado Pago, CRM) | +USD 120 |
| `multidioma` | Sitio en 2 idiomas | **+40% del subtotal** |
| `logo` | Diseño de logo / identidad | +USD 200 |
| `copy` | Redacción de textos | +USD 150 |
| `ecommerce` | Módulo de tienda online | +USD 600 *(deshabilitado con nota "incluido" cuando el tier es `medida`)* |
| `seo` | SEO técnico avanzado + analytics | +USD 100 |

**Chip informativo (no suma):** "¿Necesitás mantenimiento mensual? Lo vemos después de publicar" → link a `#contacto`.

**Multiplicador:** toggle "Lo necesito en menos de una semana" → **×1.3**.

**Config editable:** `arsRate` (cotización USD→ARS, placeholder `TODO` para el usuario) y `estimate.copy` (disclaimer, labels).

### 5.2 Función pura — `src/lib/estimate.ts`

```ts
export interface EstimateInput {
  tier: 'landing' | 'institucional' | 'medida'
  sections: number        // solo institucional, 3–8
  extras: string[]        // ids
  express: boolean
}
export interface EstimateResult {
  minUsd: number
  maxUsd: number
  minArs: number          // minUsd * arsRate
  maxArs: number
  timeline: string
  breakdown: { label: string; amountUsd: number }[]
}
export function computeEstimate(input: EstimateInput): EstimateResult
```

**Reglas de cálculo:**
1. `base = tier.base + (institucional ? (sections − 3) × 80 : 0)`
2. `subtotal = base + fijos seleccionados`; `multidioma` se aplica **después** como ×1.4 sobre ese subtotal.
3. `total = subtotal × (express ? 1.3 : 1)`
4. Rango: `minUsd = total`, `maxUsd = total × 1.2`
5. `timeline`: base del tier; `institucional && sections > 5` → +1 semana; `extras.length >= 4` → +1 semana; `express` → "Exprés: hasta 1 semana" (prevalece).
6. Redondeo a múltiplos de 10 para que el rango se lea limpio (ej. `USD 480 – USD 580`).

### 5.3 UI — `src/sections/Estimator.tsx`

- `<Section id="estimador">` con `SectionHeading`, copy nuevo en `copy.estimator.*`.
- Controles: radios de tier, slider de secciones (solo `institucional`), checkboxes de extras, toggle exprés.
- Resultado en vivo con `aria-live="polite"`: rango USD (grande) + aproximación ARS chica + plazo + desglose.
- Disclaimer: *"Estimación orientativa y no vinculante. El presupuesto cerrado lo armamos en una charla."* (coherente con `process.ts`).
- CTA "Consultar por WhatsApp" → mensaje precargado con tier, secciones, extras y rango (`buildEstimateWhatsAppMessage(input, result)` en `estimate.ts`, reutiliza `profile.whatsappNumber`).
- Chip de mantenimiento → ancla `#contacto`.
- 100% client-side: **cero fetch, cero functions** (req. fair-use).

### 5.4 Integración

- `App.tsx`: insertar `<Estimator />` entre `FAQSection` y `CTAFinal`.
- Navbar sin cambios.

---

## 6. Alcance — Precios "desde" (D10)

- `src/data/types.ts`: campo `priceFromUsd: number` en `Service`.
- `src/data/services.ts`: `250` (landing), `450` (institucional).
- `src/components/ServiceCard.tsx`: bloque "Desde USD 250" junto al plazo (fuente: `copy.services.priceLabel`).
- Coherente con el spec original del sitio (§4.3: "conviene mostrar al menos un 'desde $X'").

---

## 7. Fuera de alcance

- Cambios en Navbar, Hero, Contact, formulario Web3Forms.
- Modificar FAQ de pagos, proceso o CTAs (D9).
- i18n, modo claro, blog, testimonios (otras oportunidades identificadas, track aparte).
- Migrar el deploy a Pro o a otro hosting.
- Cambios en RLS o tablas distintas de `payments`/`projects.amount`.

---

## 8. Criterios de aceptación

- [x] `npm run build`, `npm run lint`, `npm run test` y `npm run typecheck` en verde; cobertura ≥80% (94.7% statements / 87.8% branches).
- [x] Cero referencias a `Payment`/`amount`/`currency`/`formatMoney(pagos)` en el código de paneles (búsqueda limpia).
- [x] Tabla `payments` y columnas `amount/currency` inexistentes en la DB; respaldo CSV verificado.
- [x] Link "Acceso clientes" visible en footer y funcional (llega a `/login`).
- [x] `/login`, `/acceso-admin`, `/admin/*`, `/panel/*` responden `X-Robots-Tag: noindex` y meta runtime.
- [x] Estimador: rango correcto para cada combinación de tier/secciones/Extras/exprés (tests unitarios), CTA WhatsApp con mensaje precargado.
- [x] ServiceCard muestra "Desde USD 250/450".
- [x] `conductor/fair-use.md` creado y enlazado desde `conductor/index.md`.

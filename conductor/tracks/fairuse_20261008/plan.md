# Plan: Fair-use Hobby + acceso de clientes + estimador de presupuesto

> **Track ID:** `fairuse_20261008`
> **Spec:** [../spec.md](./spec.md)
> **Status:** 📋 Spec y plan aprobados, pendiente de implementación
> **Reglas:** TDD, commits convencionales, build verde en cada commit (ver `conductor/workflow.md`).

---

## Contexto

El sitio (React 19 + Vite + Tailwind 4, deploy estático en Vercel Hobby) tiene hoy un panel admin/cliente que **gestiona cobros** (tabla `payments`, montos ARS/USD). Para mantenerse en Hobby sin caer en la cláusula de uso no comercial, se retira toda gestión monetaria del producto, se documentan guardrails, se visibiliza el acceso de clientes de forma discreta, se noindexan rutas privadas y se agrega un estimador de presupuesto 100% client-side.

**Orden de fases por dependencias:** respaldo → limpieza monetaria (código+tests) → migración SQL → accesos/noindex → precios → estimador → docs/verificación.

---

## Fase 0 — Respaldo de datos monetarios

**Objetivo:** poder dropear `payments` y `amount/currency` sin pérdida irreversible.
**Bloquea:** Fase 2.

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| 0.1 | Exportar `payments` completa y `projects (id,title,amount,currency)` a CSV | `supabase/backups/2026-10-08_billing/*.csv` | ⬜ |
| 0.2 | Agregar `supabase/backups/` a `.gitignore` | `.gitignore` | ⬜ |
| 0.3 | Verificar que filas exportadas == filas en DB (SELECT count) | — | ⬜ |

> Si no hay acceso directo a la DB desde la terminal, pedir al usuario que exporte desde el dashboard de Supabase antes de continuar.

---

## Fase 1 — Limpieza monetaria: código y tests (D1)

**Objetivo:** cero referencias a dinero/pagos en frontend y data layer. **TDD:** primero ajustar/borrar tests (rojo), luego código (verde).
**Depende de:** Fase 0 (para poder migrar después). La migración SQL llega recién en Fase 2.

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| 1.1 | Borrar test de pagos de dataLayer y ajustar fixtures de proyectos sin `amount/currency` | `src/lib/dataLayer.test.ts` | ⬜ |
| 1.2 | Actualizar `dashboard.test.ts`: `computeKpis` sin `totals` | `src/lib/dashboard.test.ts` | ⬜ |
| 1.3 | Actualizar `AdminDashboard.test.tsx`: quitar tests "finanzas ARS/USD" | `src/pages/admin/AdminDashboard.test.tsx` | ⬜ |
| 1.4 | Borrar `PaymentsPanel.test.tsx` | `src/pages/admin/PaymentsPanel.test.tsx` | ⬜ |
| 1.5 | Actualizar `ProjectsListPage.test.tsx` (sin columna Monto), `ProjectFormPage.test.tsx` (sin input Monto/validación de monto), `ProjectDetailPage.test.tsx` (sin Monto ni Pagos) | tests admin | ⬜ |
| 1.6 | Actualizar `ClientProjectDetailPage.test.tsx`: quitar sección pagos + `computePaymentTotals`; `ClientProjectsPage.test.tsx` fixtures | tests cliente | ⬜ |
| 1.7 | Ejecutar suite → rojo esperado | — | ⬜ |
| 1.8 | Eliminar `PaymentsPanel.tsx` y su uso en `ProjectDetailPage` (sección Pagos, `listPayments`, CRUD) | `src/pages/admin/PaymentsPanel.tsx`, `ProjectDetailPage.tsx` | ⬜ |
| 1.9 | `AdminDashboard`: quitar sección Finanzas, `listAllPayments` y campo `totals` | `AdminDashboard.tsx` | ⬜ |
| 1.10 | `ProjectsListPage`: quitar columna Monto; `ProjectFormPage`: quitar campos amount/currency, validación y payload | admin | ⬜ |
| 1.11 | `ClientProjectDetailPage`: quitar sección Pagos, carga de pagos y `computePaymentTotals` | cliente | ⬜ |
| 1.12 | `lib/projects.ts`: eliminar CRUD de pagos | `src/lib/projects.ts` | ⬜ |
| 1.13 | `lib/dashboard.ts`: eliminar `totals`/`emptyTotals`/suma de pagos del tipo `DashboardKpis` | `src/lib/dashboard.ts` | ⬜ |
| 1.14 | `lib/types.ts`: eliminar `Payment*`, `Project.amount/currency`, `ProjectInput.amount/currency` (conservar `Currency` para `formatMoney`/estimador) | `src/lib/types.ts` | ⬜ |
| 1.15 | `panel.ts`: eliminar copy de pagos (`client.payments`, labels, tones, `paymentKind`) | `src/data/panel.ts` | ⬜ |
| 1.16 | Suite completa verde + `npm run build` + lint | — | ⬜ |
| 1.17 | Commit `refactor(panel): remove billing and payments management` | — | ⬜ |

---

## Fase 2 — Migración SQL (D1)

**Objetivo:** eliminar el esquema de billing de Supabase.

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| 2.1 | Crear migración `DROP TABLE IF EXISTS public.payments; ALTER TABLE public.projects DROP COLUMN IF EXISTS amount, DROP COLUMN IF EXISTS currency;` | `supabase/migrations/0002_drop_billing.sql` | ⬜ |
| 2.2 | Aplicar migración a la DB (Supabase CLI o SQL editor) y verificar con `\d`/query | DB | ⬜ |
| 2.3 | Commit `chore(db): drop billing tables and columns` | — | ⬜ |

---

## Fase 3 — Acceso de clientes y noindex (D2, D3)

**Objetivo:** login visible solo en footer; rutas privadas no indexables.

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| 3.1 | **TDD:** test en `Footer.test.tsx` — renderiza link "Acceso clientes" → `/login` (rojo) | `src/components/Footer.test.tsx` | ⬜ |
| 3.2 | Agregar `copy.footer.clientAccess` y el `<Link>` en el Footer | `src/data/copy.ts`, `src/components/Footer.tsx` | ⬜ |
| 3.3 | **TDD:** test de `applyRobotsMeta` (noindex en privadas, limpia en públicas) | `src/utils/seo.test.ts` | ⬜ |
| 3.4 | Implementar `applyRobotsMeta` + efecto por ruta en `AppRouter` | `src/utils/seo.ts`, `src/routes/AppRouter.tsx` | ⬜ |
| 3.5 | Headers `X-Robots-Tag: noindex` para `/login`, `/acceso-admin`, `/admin/:path*`, `/panel/:path*` | `vercel.json`, `netlify.toml` | ⬜ |
| 3.6 | Verificar header con `curl -I` en preview deploy | deploy | ⬜ |
| 3.7 | Commit `feat(access): client login link and noindex private routes` | — | ⬜ |

---

## Fase 4 — Precios "desde" en servicios (D10)

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| 4.1 | **TDD:** `ServiceCard.test.tsx` — muestra "Desde USD 250" (rojo) | `src/components/ServiceCard.test.tsx` | ⬜ |
| 4.2 | `Service.priceFromUsd` + valores en `services.ts` | `src/data/types.ts`, `src/data/services.ts` | ⬜ |
| 4.3 | Render en `ServiceCard` + `copy.services.priceLabel` | `ServiceCard.tsx`, `copy.ts` | ⬜ |
| 4.4 | Commit `feat(services): restore from-price display` | — | ⬜ |

---

## Fase 5 — Estimador de presupuesto (D4–D8)

**Objetivo:** sección `#estimador` con cálculo en vivo y CTA WhatsApp. **TDD primero en la lógica pura.**

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| 5.1 | **TDD:** `src/lib/estimate.test.ts` — tabla de casos: cada tier base, slider de secciones (+80), cada extra fijo, multidioma ×1.4 aplicado al subtotal, exprés ×1.3, rango ×1.2, redondeo a múltiplos de 10, timeline (sections>5 → +1 sem, ≥4 extras → +1 sem, exprés prevalece), tier `medida` deshabilita `ecommerce` (rojo) | `src/lib/estimate.test.ts` | ⬜ |
| 5.2 | Crear `src/data/estimate.ts` (tiers, extras, `arsRate` con `TODO`, copy) y `src/lib/estimate.ts` (`computeEstimate`, `buildEstimateWhatsAppMessage`) | datos + lib | ⬜ |
| 5.3 | Suite de lógica verde | — | ⬜ |
| 5.4 | **TDD:** `Estimator.test.tsx` — render de controles, actualización del rango al cambiar tier/sections/exprés, `aria-live`, CTA WhatsApp con mensaje precargado, disclaimer, chip mantenimiento (rojo) | `src/sections/Estimator.test.tsx` | ⬜ |
| 5.5 | Implementar `src/sections/Estimator.tsx` + `copy.estimator.*` en `copy.ts` | sección | ⬜ |
| 5.6 | Insertar `<Estimator />` entre `FAQSection` y `CTAFinal` en `App.tsx`; ajustar `App.test.tsx` (sección presente, sin duplicar heading) | `src/App.tsx`, `src/App.test.tsx` | ⬜ |
| 5.7 | Suite verde + build + lint + coverage ≥80% | — | ⬜ |
| 5.8 | Commit `feat(estimator): client-side budget estimator section` | — | ⬜ |

---

## Fase 6 — Documentación fair-use y verificación final (D1)

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| 6.1 | Crear `conductor/fair-use.md`: límites Hobby, reglas (cero functions, cero cobros en este deploy, panel = project management), señales de migración a Pro, anti-patrones | `conductor/fair-use.md` | ⬜ |
| 6.2 | Enlazar desde `conductor/index.md` | `conductor/index.md` | ⬜ |
| 6.3 | Checklist del spec §8 completa: `build`, `lint`, `test`, `typecheck`, grep sin referencias a pagos, verificación manual de footer/noindex/estimador | — | ⬜ |
| 6.4 | Actualizar estado del track en `conductor/tracks.md` y checkboxes de este plan | `conductor/tracks.md`, `plan.md` | ⬜ |
| 6.5 | Commits finales + resumen de fase al usuario | — | ⬜ |

---

## Verificación por fase (protocolo `workflow.md`)

Tras cada fase: presentar resumen al usuario para verificación manual antes de marcar `[x]` y pasar a la siguiente. La **Fase 0 y 2** requieren confirmación explícita del usuario (操作 sobre la DB).

## Riesgos

| Riesgo | Mitigación |
|--------|-----------|
| Sin acceso a la DB para respaldo/migración | Pedir exportación manual al usuario; no ejecutar Fase 2 sin respaldo verificado |
| Tests de secciones (`App.test`) acoplados al orden/heading | Ajustar asserts junto con la inserción del `<Estimator />` en la misma tarea |
| `arsRate` placeholder visible para el usuario final | Marcar `TODO(arsRate)`; definir valor con el usuario antes de publicar (checklist final) |
| Datos de pagos reales en CSV dentro del repo | `.gitignore` de `supabase/backups/` en Fase 0 antes de exportar |

# Plan — Solicitud de presupuesto sin precios públicos

> **Track ID:** `quote_request_20261024`
> **Spec:** [./spec.md](./spec.md)
> **Estado:** Planificado.
> **Reglas:** TDD, sin serverless nuevo, sin montos en cliente/servidor/panel, respuesta manual del owner.

---

## Fase T0 — Auditoría y contrato de decisión

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T0.1 | Inventariar todo uso público de precios: `priceFromUsd`, `baseUsd`, `amountUsd`, `percent`, `formatMoney`, `computeEstimate`, `buildEstimateWhatsAppMessage`, “USD”, “ARS”, “Desde” y mantenimiento | `src/sections/`, `src/components/`, `src/data/`, `src/lib/`, tests | Pendiente |
| T0.2 | Confirmar el shape del request: `name`, `email`, `tier`, `sections`, `extras`, `notes`, `consent` | `src/shared/quote-contract.ts` (nuevo) | Pendiente |
| T0.3 | Documentar la extensión de `contact-notify` y verificar que no se crean funciones ni montos | `conductor/fair-use.md` | Pendiente |
| T0.4 | Redactar borrador de privacidad/términos y definir `CONSENT_VERSION = '2026-10-24'` | `src/pages/legal/`, `spec.md` | Pendiente |
| T0.5 | Confirmar acción Turnstile `quote`, remitente/destinatario Resend y límites de rate limit | `src/shared/quote-contract.ts`, Supabase | Pendiente |

## Fase T1 — Contrato compartido y validación

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T1.1 | Contrato puro: IDs de tier/extras, límites de nombre/email/notas, consentimiento y acción Turnstile; reutilizar email/control chars de `contact-contract.ts` | `src/shared/quote-contract.ts`, `src/shared/contact-contract.ts` | Pendiente |
| T1.2 | Builder/validator del payload en cliente | `src/utils/quotePayload.ts` (nuevo) | Pendiente |
| T1.3 | `Turnstile` acepta `action` con default `contact`; el formulario de contacto pasa su acción y el de presupuesto pasa `quote` | `src/components/Turnstile.tsx`, `src/components/ContactForm.tsx` | Pendiente |
| T1.4 | Tests de contrato: emails inválidos, control chars, tier/extra no permitido, consentimiento faltante, notas largas | `src/shared/quote-contract.test.ts`, `src/utils/quotePayload.test.ts` | Pendiente |
| T1.5 | Test de Turnstile con acción configurable | `src/components/Turnstile.test.tsx` | Pendiente |

## Fase T2 — Migración `0018_quote_requests.sql`

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T2.1 | Tabla `quote_requests` sin columnas de dinero: `id`, `name`, `email`, `tier`, `sections`, `extras text[]`, `notes`, `consent_at`, `consent_version`, `status`, `created_at`, `contacted_at` | `supabase/migrations/0018_quote_requests.sql` | Pendiente |
| T2.2 | CHECKs: largos, email, control chars, tier permitido, extras allowlist, status permitido | idem | Pendiente |
| T2.3 | Índices por `created_at`, `status` y `email`; RLS admin (helper vigente, AAL2 si corresponde); revocar INSERT/UPDATE/DELETE a `anon` y `authenticated`; service role inserta | idem | Pendiente |
| T2.4 | Trigger de rate limit análogo a `throttle_contact_messages` (0010): 1/min por IP, 3/hora por email, 60/hora global, fail-closed sin IP | idem | Pendiente |
| T2.5 | Tipos `QuoteRequest`, `QuoteRequestInput`, `QuoteRequestStatus` | `src/lib/types.ts` | Pendiente |

## Fase T3 — Edge Function `contact-notify`

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T3.1 | Discriminar `kind: 'contact' \| 'quote'` sin romper el flujo actual | `supabase/functions/contact-notify/index.ts` | Pendiente |
| T3.2 | Validar quote con el contrato compartido y Turnstile acción `quote` | `supabase/functions/contact-notify/validation.ts` | Pendiente |
| T3.3 | Insertar primero en `quote_requests`; si falla el email, el lead queda guardado y visible en admin | idem | Pendiente |
| T3.4 | Enviar email al owner con nombre, email, tier, secciones, extras, notas y consentimiento; **no** enviar email al solicitante | `supabase/functions/contact-notify/index.ts` | Pendiente |
| T3.5 | Tests: contacto sigue funcionando; quote válido inserta y envía; quote inválido/ Turnstile/rate limit rechaza; no hay email al solicitante | `supabase/functions/contact-notify/index.test.ts`, `validation.test.ts` | Pendiente |
| T3.6 | Documentar secrets y deploy en el checklist del owner | `plan.md`, `conductor/fair-use.md` | Pendiente |

## Fase T4 — Landing sin precios

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T4.1 | Quitar `priceFromUsd` de servicios y cualquier precio base/extra del catálogo público | `src/data/services.ts`, `src/data/estimate.ts` | Pendiente |
| T4.2 | Eliminar `computeEstimate` y `buildEstimateWhatsAppMessage`; si se conserva el plazo, extraer `estimateTimeline` puro sin dinero | `src/lib/estimate.ts` | Pendiente |
| T4.3 | Refactor del estimador a brief: selección de tier/secciones/extras, plazo no vinculante, nombre, email, notas y consentimiento; sin rangos, ARS, breakdown ni mantenimiento | `src/sections/Estimator.tsx` | Pendiente |
| T4.4 | `ServiceCard` sin “Desde USD”; CTA “Solicitar presupuesto”; revisar `Services.tsx` y copy | `src/components/ServiceCard.tsx`, `src/sections/Services.tsx`, `src/data/copy.ts` | Pendiente |
| T4.5 | Reemplazar el CTA de WhatsApp con precio por envío al panel; el WhatsApp queda solo como contacto general | `src/sections/Estimator.tsx`, `src/components/Contact.tsx` | Pendiente |
| T4.6 | Tests: no aparece USD/ARS/Desde/rangos; el formulario valida email/consentimiento; éxito y error; el plazo se muestra sin precio | `src/sections/Estimator.test.tsx`, `src/components/ServiceCard.test.tsx` | Pendiente |
| T4.7 | Verificar que el brief admin (`ProjectBrief`) siga leyendo labels/IDs sin depender de precios | `src/pages/admin/`, `src/lib/types.ts` | Pendiente |

## Fase T5 — Panel admin

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T5.1 | Capa de datos: listar, obtener, cambiar estado y borrar spam | `src/lib/quoteRequests.ts` (nuevo) | Pendiente |
| T5.2 | Página `/admin/presupuestos`: listado con email, nombre, tier, secciones, extras, estado y fecha; detalle expandible; “Contactar” con `mailto:`; marcar contactado/cerrado | `src/pages/admin/QuoteRequestsPage.tsx` (nuevo) | Pendiente |
| T5.3 | Ruta lazy dentro del bloque admin y nav | `src/routes/PrivateRoutes.tsx`, `src/pages/admin/AdminLayout.tsx` | Pendiente |
| T5.4 | KPI “Solicitudes nuevas” en el dashboard | `src/pages/admin/AdminDashboard.tsx` | Pendiente |
| T5.5 | Copy del panel: nav, estados, vacío, error, detalle y email de contacto | `src/data/panel.ts` | Pendiente |
| T5.6 | Tests de página: render, estado, mailto, sin montos | `src/pages/admin/QuoteRequestsPage.test.tsx` | Pendiente |

## Fase T6 — Legal, privacidad y consentimiento

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T6.1 | Página de privacidad: responsable, datos, finalidad, base legal, encargados (Supabase, Resend, Cloudflare, Vercel), retención, derechos, seguridad, analytics y contacto | `src/pages/legal/PrivacyPage.tsx` (nuevo) | Pendiente |
| T6.2 | Página de términos: alcance, presupuestos no vinculantes, validez, PI, responsabilidad, jurisdicción y contacto | `src/pages/legal/TermsPage.tsx` (nuevo) | Pendiente |
| T6.3 | Rutas públicas explícitas antes del catch-all `*` | `src/routes/AppRouter.tsx` | Pendiente |
| T6.4 | Componente de consentimiento reutilizable con links a privacidad/términos y texto de contacto | `src/components/LegalConsent.tsx` (nuevo) | Pendiente |
| T6.5 | Integrar consentimiento en solicitud de presupuesto y en `ContactForm`; guardar versión/fecha | `src/sections/Estimator.tsx`, `src/components/ContactForm.tsx` | Pendiente |
| T6.6 | Links legales en footer y revisión de que no rompan el layout | `src/components/Footer.tsx` | Pendiente |
| T6.7 | Tests de páginas legales, links y bloqueo por consentimiento | `src/pages/legal/*.test.tsx`, `src/components/LegalConsent.test.tsx` | Pendiente |

## Fase T7 — Documentación y verificación

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T7.1 | Actualizar producto/guías: el estimador ya no muestra precios; el presupuesto se responde manualmente | `conductor/product.md`, `conductor/product-guidelines.md` | Pendiente |
| T7.2 | Registrar el track y su estado | `conductor/tracks.md` | Hecho |
| T7.3 | Grep de precios en la vía pública y revisión del bundle | `src/`, `dist/` | Pendiente |
| T7.4 | `npm run test`, `npm run typecheck`, `npm run lint`, `npm run build` y cobertura | Vitest / tsc / ESLint / Vite | Pendiente |
| T7.5 | Smoke manual: solicitud → email owner → panel → mailto → respuesta | Navegador + Supabase | Pendiente owner |

---

## Checklist del owner

- [ ] Revisar el texto legal con un abogado antes de publicar.
- [ ] Aplicar `supabase/migrations/0018_quote_requests.sql`.
- [ ] Desplegar la Edge Function `contact-notify` actualizada.
- [ ] Verificar Turnstile con la acción `quote` y el secreto vigente.
- [ ] Verificar Resend, remitente y destinatario del owner.
- [ ] Probar una solicitud real de punta a punta.
- [ ] Revisar que el catálogo de precios no quede en el bundle público.
- [ ] Definir retención de leads (propuesta: 12 meses) y cómo se eliminan.

---

## Riesgos

| Riesgo | Mitigación |
|--------|------------|
| La revisión legal demora o cambia el alcance | Publicar con borrador revisado; el consentimiento y la versión quedan desacoplados del código de negocio. |
| Quedan precios en el bundle o en tests viejos | Grep + test de regresión + revisión del bundle antes de cerrar. |
| Spam al email del owner | Turnstile, honeypot, rate limit por IP/email y fallo cerrado. |
| Caída de conversión al ocultar precios | Copy claro con plazo de respuesta y CTA de bajo compromiso; medir y ajustar. |
| Falla de Resend después del insert | Insertar primero; el lead queda en el panel y se puede reintentar/contactar manualmente. |
| RLS mal configurada | Probar con anon, cliente y admin AAL2; revocar escrituras directas. |
| El plazo estimado se interpreta como compromiso | Etiquetarlo como “referencia no vinculante” y aclararlo en términos. |
| Datos personales sin retención definida | Documentar 12 meses y agregar limpieza manual o job administrativo. |

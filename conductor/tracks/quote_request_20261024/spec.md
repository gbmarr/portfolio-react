# Spec — Solicitud de presupuesto sin precios públicos

> **Track ID:** `quote_request_20261024`
> **Fuente:** Pedido del owner (2026-10-24).
> **Estado:** Planificado (spec + plan aprobados; sin implementar).

---

## 1. Contexto y objetivo

Hoy la landing muestra precios y rangos calculados en el cliente (`Estimator`, `ServiceCard`, `computeEstimate`). El owner quiere dejar de exponer precios, reservar mejor su catálogo y saber quién solicita un presupuesto.

La restricción vigente de fair-use (`conductor/fair-use.md`) prohíbe:

- serverless nuevo en Vercel;
- cálculo de precios del lado servidor;
- montos, columnas de dinero o renders de importes en el panel.

Por eso este track **no automatiza el envío del presupuesto**. El flujo es: el usuario arma su proyecto, deja su email y acepta privacidad/términos; la solicitud queda registrada; el owner recibe el lead y **responde manualmente** con un presupuesto personalizado.

**Objetivo:** reemplazar la calculadora pública de precios por un formulario de solicitud de presupuesto con consentimiento, panel admin dedicado y respuesta manual del owner, sin montos en cliente, servidor ni panel.

## 2. Functional Requirements

- **FR1 — Landing sin precios:** eliminar de la vía pública todo importe, rango USD/ARS, breakdown de extras, chip de mantenimiento y mensaje de WhatsApp con precios. `ServiceCard` pasa a “Presupuesto a medida” + CTA “Solicitar presupuesto”. Auditar `src/sections/Services.tsx`, `src/components/ServiceCard.tsx`, `src/data/services.ts`, `src/data/estimate.ts`, `src/lib/estimate.ts` y copy asociado.
- **FR2 — Formulario de solicitud:** el estimador se convierte en un brief de proyecto con tipo, secciones, extras y notas. Agrega nombre, email, consentimiento obligatorio, honeypot, Turnstile con acción `quote` e intervalo mínimo de 3 s. No muestra precios. El mensaje de éxito informa el plazo de respuesta.
- **FR3 — Plazo estimado:** se mantiene como dato no vinculante en la landing, sin importes. El precio se comunica únicamente en la respuesta manual del owner.
- **FR4 — Backend:** extender la Edge Function `contact-notify` para aceptar `kind: 'contact' | 'quote'`. Para `quote`: validar payload, insertar en `quote_requests`, guardar `consent_at`/`consent_version` y enviar un email al owner con el detalle. **No se envía email automático al solicitante en v1.**
- **FR5 — Panel admin:** nueva página `/admin/presupuestos` con listado, detalle, estado (`new` / `contacted` / `closed`), botón “Contactar” vía `mailto:` y KPI en el dashboard. Sin importes.
- **FR6 — Legal y consentimiento:** páginas públicas `/privacidad` y `/terminos`, links en footer y en ambos formularios. El formulario de contacto existente también exige consentimiento. Divulgación de Vercel Analytics y de los encargados del tratamiento.
- **FR7 — Documentación:** actualizar `conductor/fair-use.md` documentando la extensión de `contact-notify` y confirmando que no hay montos ni serverless nuevo. Actualizar `conductor/product.md`, `conductor/product-guidelines.md` y `conductor/tracks.md`.

## 3. Non-Functional Requirements

- **NFR1 — Fair-use:** sin Vercel Functions, sin pagos y sin columnas/render de dinero. Solo se extiende la excepción existente `contact-notify`.
- **NFR2 — Privacidad:** minimización de datos; el catálogo de precios se elimina del bundle público (no solo se oculta de la UI). Consentimiento versionado y política de retención documentada.
- **NFR3 — Abuso:** Turnstile, honeypot, rate limit por IP y por email, fallo cerrado. Sin email automático al solicitante.
- **NFR4 — Accesibilidad:** labels, errores anunciados, foco visible, navegación por teclado y mensajes `aria-live`.
- **NFR5 — Calidad:** TDD, suite/typecheck/lint/build verdes y cobertura ≥80 %.
- **NFR6 — Copy:** español rioplatense, segunda persona, dolor antes que feature; sin promesas de precio ni plazos garantizados.

## 4. Acceptance Criteria

- [ ] AC1: no aparece “USD”, “ARS”, “Desde” ni rangos de precio en la landing; hay tests que lo verifican.
- [ ] AC2: una solicitud válida crea un registro en `quote_requests` y dispara el email al owner; el solicitante ve una confirmación sin precio.
- [ ] AC3: el admin ve el lead completo en `/admin/presupuestos`, puede marcarlo como contactado y abrir el `mailto:`; no ve montos.
- [ ] AC4: email inválido, consentimiento faltante, Turnstile fallido o rate limit excedido bloquean el envío.
- [ ] AC5: `/privacidad` y `/terminos` son accesibles desde el footer y desde los formularios; el formulario de contacto también exige consentimiento.
- [ ] AC6: el catálogo de precios ya no está en el bundle público.
- [ ] AC7: build, lint, typecheck, tests y cobertura pasan; no hay anti-patrones de fair-use.

## 5. Out of Scope

- Envío automático del presupuesto al usuario.
- Cálculo de precios del lado servidor.
- Almacenar o mostrar montos en el panel.
- Pagos, facturación, PDF, CRM, multiidioma y portal de cliente.
- Doble opt-in y acuse automático (posible fase 2).
- Automatizaciones de seguimiento o campañas de email.

## 6. Decisiones

- **D1 — Respuesta manual:** el owner responde el presupuesto desde su email; no hay envío automático en v1. Evita spam, problemas de entregabilidad y conflicto con fair-use.
- **D2 — Una sola Edge Function:** se extiende `contact-notify` con un discriminante `kind`; no se crea otra función.
- **D3 — Tabla dedicada:** `quote_requests`, sin columnas de dinero; RLS solo admin y service role para insertar.
- **D4 — Precios fuera del bundle:** se eliminan del código público, no solo se ocultan. El owner conserva su criterio de pricing fuera del repo.
- **D5 — Consentimiento versionado:** obligatorio en solicitud de presupuesto y contacto; `consent_version = '2026-10-24'`, revisable si cambia la política.
- **D6 — Plazo estimado:** se mantiene como referencia no vinculante; el precio se envía solo en la respuesta manual.

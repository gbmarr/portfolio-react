# Track: Referencia de presupuesto en panel admin

## Contexto
El usuario envía la solicitud de presupuesto sin ver precios. El admin necesita una referencia rápida del rango estimado para responder más ágilmente por email/WhatsApp, sin tener que calcularlo manualmente.

## Objetivo
Mostrar un rango estimado (solo lectura) en /admin/presupuestos basado en las selecciones guardadas, sin persistir montos, sin exponer precios al público y sin violar las reglas de fair-use.

## Requisitos funcionales
- FR1: Restaurar catálogo de precios solo en src/data/estimate.ts (baseUsd por tier, precios/fórmulas de extras). Sin tocar componentes públicos.
- FR2: Restaurar computeEstimate en src/lib/estimate.ts para cálculo on-the-fly. Puede convivir con buildEstimateTimeline.
- FR3: En QuoteRequestsPage mostrar sección ""Estimado (referencia)"" con rango USD min-max, aproximado ARS, timeline y desglose opcional.
- FR4: El cálculo es efímero (no se guarda en BD, no se edita, no es facturable).

## Requisitos no funcionales
- NFR1: Ningún componente público (App, sections/*, components/ServiceCard, Estimator) debe importar lógica de precios.
- NFR2: Sin cambios en migraciones, Edge Function o esquema de quote_requests.
- NFR3: Solo lectura. Sin gestión de montos/cobro/facturación.
- NFR4: Tests actualizados, typecheck/lint/build verdes.

## Criterios de aceptación
- AC1: Admin ve rango estimado en el detalle de cada solicitud.
- AC2: No hay precios/rangos en la landing, formularios públicos ni bundle público.
- AC3: No se agrega ninguna columna de monto a la BD.
- AC4: Tests pasan.

## Fuera de alcance
- Persistir el monto calculado
- Editar precios desde el panel
- Facturación/pagos
- Mostrar precio al solicitante

## Decisiones
- D1: Cálculo on-the-fly en cliente admin, sin guardar.
- D2: Precios solo internos (no exponer al bundle público).
- D3: Referencia informativa, no vinculante.

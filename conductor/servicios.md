# Catálogo de servicios — especificación interna

> **Propósito:** documento de referencia que describe cada servicio ofrecido en el sitio: qué es, qué aporta, cómo se desarrolla, qué requiere y qué complejidad tiene. Sirve para presupuestar con fundamento, armar el estimador sin incoherencias y responder consultas de clientes.
>
> **Fuentes de verdad (mantener sincronizadas con este documento):**
> - Servicios públicos — `src/data/services.ts`
> - Tiers y extras del estimador — `src/data/estimate.ts`
> - Proceso de trabajo — `src/data/process.ts`
> - Copy público — `src/data/copy.ts`
>
> **Guardrail fair-use (ver `conductor/fair-use.md`):** el deploy es 100% estático en Vercel Hobby. **Nunca** se agregan funciones serverless (`/api`, edge, cron) para operación del negocio. Todo lo que aquí aparece como "requerimiento de backend" se resuelve con servicios externos (Supabase, Web3Forms, Mercado Pago Checkout/link) o redirección client-side. Los precios de este documento son internos / de referencia del estimador.

---

## 1. Proceso transversal

Todos los servicios siguen el mismo proceso público (`process.ts`), con distinto peso en cada paso:

| # | Paso | En qué consiste | Peso por servicio |
|---|------|----------------|-------------------|
| 1 | **Contame qué necesitás** | Charla por WhatsApp/email. Se define objetivo, público, alcance y contenido disponible. | Baja en todos (pero en "a medida" es discovery profundo) |
| 2 | **Te paso un presupuesto cerrado** | Precio fijo y plazo definido. Para proyectos a medida incluye alcance escrito y modelo de datos. | Media |
| 3 | **Diseño y desarrollo** | Diseño a medida, maquetado, programación, revisiones en el medio. | Alta: acá vive la complejidad |
| 4 | **Publicamos y te explico** | Deploy, conexión de dominio, capacitación de edición y documentación. | Baja–media (mayor en a medida) |

Reglas generales del paso 3 (aplican a todos):
- Diseño personalizado sobre tokens propios ("Dark & Modern", Tailwind 4), responsive mobile-first.
- Formularios de contacto con honeypot + rate-limit (Web3Forms + copia a Supabase).
- SEO básico siempre: meta title/description, Open Graph, sitemap, robots técnico.
- Publicación en Vercel (estático) con dominio propio del cliente (el costo de dominio/hosting va aparte — FAQ del sitio).
- Se entrega explicación de edición de contenido simple.

---

## 2. Servicios principales

### 2.1 Landing page

| Campo | Detalle |
|-------|---------|
| **Precio referencia** | Desde USD 250 (estimador) |
| **Plazo** | 1 a 2 semanas |
| **Dónde se ofrece** | Card pública (`ServiceCard`) + tier del estimador |

**Qué es / función**
Página única diseñada para una sola acción: conseguir contactos, vender un producto/servicio puntual o validar una campaña. Es la presencia online rápida: una campaña, un producto o un evento.

**Qué hace / qué aporta**
- Convierte tráfico (Google, redes, anuncios) en un único CTA (WhatsApp, formulario, mail).
- Da "existencia digital" inmediata a comercios/emprendimientos sin sitio.
- Sirve de aterrizaje para campañas pagas (Menor costo de "no estás en Google").
- Base para escalar después a un sitio institucional.

**Procedimiento de desarrollo**
1. **Charla:** definir la oferta, el público y la acción única que se busca. Entregables del cliente: textos, fotos, logo y datos de contacto (si no los tiene → extras copy/logo).
2. **Presupuesto cerrado:** estructura típica (Hero → problema → beneficios → prueba social → FAQ → CTA → contacto) y fuentes de contenido.
3. **Diseño y desarrollo:** diseño único y a medida, maquetado responsive, formulario de contacto (Web3Forms + copia a Supabase para no perder mensajes), SEO básico (meta, OG) y carga rápida (assets optimizados, cero functions).
4. **Publicación y explicación:** deploy estático en Vercel, conexión del dominio del cliente, instrucciones de edición de textos simples.

**Complejidad: baja.**
Una sola página, estática, sin navegación ni estado. El riesgo es de copy/diseño, no de ingeniería.

**Requerimientos**
- Dominio propio del cliente (o subdominio) — costo aparte.
- Hosting estático (Vercel Hobby alcanza; 0 functions).
- Contenido: textos, fotos, logo (o encargar extras).
- Formulario: clave de Web3Forms (`FORM_ACCESS_KEY`) + Supabase opcional para copia de seguridad de mensajes.
- Sin DB propia, sin auth, sin pagos.

**Ejemplo aplicado**
Un **electricista** (rubro real de `industries.ts`, "Oficios y reparaciones"): landing de una página con CTA de WhatsApp de emergencia, servicios, zona de cobertura y mini-galeria de trabajos. Objetivo: que "electricista cerca de mí" termine en un mensaje.

---

### 2.2 Sitio institucional

| Campo | Detalle |
|-------|---------|
| **Precio referencia** | Desde USD 450 (estimador) |
| **Plazo** | 2 a 4 semanas |
| **Dónde se ofrece** | Card pública (`ServiceCard`) + tier del estimador |

**Qué es / función**
Sitio permanente multi-sección para un negocio o estudio que quiere presencia seria y completa: servicios, sobre nosotros, contacto, FAQ, etc. **Hasta 5 secciones** en el precio base (el estimador permite 3–8 secciones, +USD 80 por sección extra sobre la base).

**Qué hace / qué aporta**
- Posiciona al negocio como establecido y confiable antes de la primera consulta.
- Funciona 24/7 como canal de contacto y de respuesta a objeciones (FAQ, horarios, cobertura).
- Mejora el SEO local (rubros de `industries.ts`: contadores, abogados, psicólogos, gimnasios…).
- El cliente aprende a editar contenido simple él mismo (promesa del servicio).

**Procedimiento de desarrollo**
1. **Charla:** arquitectura de secciones (mapa del sitio), rubro, audiencias y contenido. Entregables: textos por sección, fotos, logo.
2. **Presupuesto cerrado:** alcance por sección y fuentes de contenido; se define si suman extras (blog, integraciones, multidioma).
3. **Diseño y desarrollo:** SPA con navegación por anclas, diseño de sistema consistente entre secciones, formularios por contexto, SEO por sección (meta/schema), documentación de edición.
4. **Publicación y explicación:** deploy, dominio, y capacitación práctica: "cómo cambio el texto de tal sección".

**Complejidad: media.**
Más secciones, más copy y más arquitectura de información; navegación y consistencia visual agregan trabajo. Sigue siendo 100% estático.

**Requerimientos**
- Dominio propio + hosting estático.
- Contenido por sección (textos, fotos, logo) — o extras de redacción/identidad.
- Formulario(s) de contacto (Web3Forms + Supabase opcional).
- Si el cliente quiere publicar contenido solo → extra **Blog / CMS** (evita el "¿cómo edito?").
- SEO local básico (sitemap, schema Organization/LocalBusiness recomendado).

**Ejemplo aplicado**
Una **psicóloga** (rubro real "Salud y bienestar"): 5 secciones — Inicio, Sobre mí (formación y enfoque), Servicios (consulta online/presencial), Preguntas frecuentes y Contacto con botón de WhatsApp. Objetivo: convertir búsquedas locales en turnos.

---

### 2.3 E-commerce o proyecto a medida

| Campo | Detalle |
|-------|---------|
| **Precio referencia** | USD 1.200 base (estimador, tier "medida") |
| **Plazo** | 4 a 8 semanas |
| **Dónde se ofrece** | Solo en el estimador (no tiene card pública) |

**Qué es / función**
Dos variantes bajo el mismo paraguas:
- **Tienda online completa:** catálogo, carrito, checkout y medios de pago.
- **Aplicación web a medida:** portales, sistemas de gestión, dashboards, MVPs con datos propios (usuarios, roles, RLS).

Es el servicio "cuando la página web no alcanza": hay lógica, datos y procesos.

**Qué hace / qué aporta**
- Convierte el negocio en canal digital con venta o gestión automatizada.
- Reemplaza planillas/libretas por un sistema (casos reales del repo: **Dranes**, **SimpleHC**).
- Habilita multi-usuario con roles (cliente/admin) y datos protegidos por fila (RLS en Supabase).
- Aporta diferenciación real: la competencia no tiene sistema propio.

**Procedimiento de desarrollo**
1. **Charla (discovery profundo):** proceso de negocio, usuarios, datos que maneja, integraciones necesarias, definición de MVP. Es la fase más importante y la que más tiempo absorbe.
2. **Presupuesto cerrado:** alcance escrito, wireframes y modelo de datos; se define el plan de pagos y entregas parciales.
3. **Diseño y desarrollo:**
   - Arquitectura: frontend estático (React/Vite) + Supabase (Postgres, Auth, Storage, RLS).
   - Modelo de datos y políticas de seguridad por rol (patrón `profiles` + `is_admin()` ya usado).
   - Paneles de gestión y de cliente (patrón `/admin` + `/panel` del propio portfolio).
   - Integraciones (pagos, turnos, CRM) — ver extras.
   - Testing: unitario (Vitest ≥80% cobertura) e integral del flujo.
4. **Publicación y capacitación:** deploy estático, documentación de uso, entrenamiento de usuarios reales.

**Complejidad: alta.**
Hay base de datos, autenticación, roles, integraciones, estados y casos de error. Es donde aparece el riesgo de alcance (mitigado por el presupuesto cerrado y el MVP).

**Requerimientos**
- Dominio + hosting estático (Vercel Hobby sirve mientras el procesamiento sea client-side).
- **DB y auth:** Supabase (Postgres + RLS). Plan free alcanza para volúmenes chicos.
- **Pagos (si vende):** Mercado Pago **Checkout Pro / link de pago** (redirección). ⚠️ Guardrail: **no** procesar pagos con serverless en este deploy; tampoco alojar transacciones en la DB del cliente si es operación comercial (revisar `fair-use.md`).
- Credenciales de terceros (API keys de CRM, calendarios, pasarelas).
- Contenido y datos a migrar: catálogo, historial, reglas de negocio.
- Storage para imágenes/subidas si aplica.

**Ejemplo aplicado**
**Dranes** (caso real, "Proyecto propio"): app para un personal trainer que reemplaza libretas — planes de entrenamiento, historial y progreso de clientes, con roles (trainer/admin y cliente). En versión comercial sería: portales de clientes con login, agenda y aprobación de hitos (como el panel actual del portfolio).

---

### 2.4 Mantenimiento mensual

| Campo | Detalle |
|-------|---------|
| **Precio referencia** | Sin precio fijo (chip informativo del estimador: "Lo vemos después de publicar") |
| **Plazo** | Recurrente mensual |
| **Dónde se ofrece** | Como nota del estimador, no como servicio a la venta |

**Qué es / función**
Plan de soporte post-publicación para cambios frecuentes de contenido, ajustes y supervisión. No es desarrollo nuevo: es evolución sostenida.

**Qué hace / qué aporta**
- Garantiza que el sitio no quede desactualizado (precios, horarios, novedades).
- Da acceso a un canal directo con prioridad para el cliente.
- Separa "cambios puntuales" (presupuesto por ajuste) de "cambios frecuentes" (plan mensual) — coherente con el FAQ del sitio.

**Procedimiento de desarrollo**
1. Relevamiento mensual o a demanda de cambios pedidos.
2. Implementación incremental (textos, imágenes, secciones menores).
3. Deploy y verificación.
4. Reporte breve de lo hecho.

**Complejidad: baja por mes** (cambios incrementales sobre una base ya hecha). Media si el cliente abusa del plan como desarrollo encubierto → renegociar alcance.

**Requerimientos**
- Acceso al repo/deploy y a las credenciales (Supabase/Web3Forms).
- Acuerdo de alcance mensual (cantidad de cambios, qué se considera cambio simple).
- Sin infraestructura propia adicional.

**Ejemplo aplicado**
Estudio contable con sitio institucional: cada mes actualiza horarios, novedades impositivas (blog) y el equipo. El mantenimiento cubre esos cambios sin re-presupuestar cada uno.

---

## 3. Extras del estimador

### 3.1 Blog / CMS editable — +USD 150

**Qué es / función:** sistema para que el cliente publique contenido (noticias, tips, artículos) sin tocar código.
**Qué hace / aporta:** posicionamiento SEO por contenido, comunicación constante con clientes, y libera al desarrollador de tareas recurrentes. Combina con: institucional, medida.
**Procedimiento:** definir tipos de contenido → modelo de datos (Supabase) → panel de edición con roles (admin/publicador) → publicación con rutas de detalle y listados → SEO (meta por artículo, sitemap).
**Complejidad: media.** CRUD completo + editor + permisos (RLS) + frontend de listado/detalle.
**Requerimientos:** DB (Supabase) y opcional Storage para imágenes; auth de editores; contenido inicial (o extra de redacción). Bajo fair-use: perfecto, todo client-side contra Supabase.
**Ejemplo:** academia de inglés (rubro "Educación") con blog de tips por nivel; el CMS evita que cada publicación pase por el desarrollador.

### 3.2 Formularios e integraciones (APIs, Mercado Pago, CRM) — +USD 120

**Qué es / función:** conectar el sitio con servicios externos: formularios avanzados (multipaso, adjuntos), envío a CRM/Sheets/mail, reservas/turnos, pagos con Mercado Pago, notificaciones.
**Qué hace / aporta:** automatiza el "después del formulario" (el lead llega donde debe), habilita reserva de turnos y cobro online sin que el cliente gestione nada manual.
**Procedimiento:** relevar el servicio destino y sus credenciales → implementar el envío client-side (fetch directo a API del proveedor) → manejo de errores y disclaimers → prueba end-to-end.
**Complejidad: media.** Cada integración es un mundo (auth, webhooks, rate limits); el riesgo es la variedad de proveedores.
**Requerimientos:** credenciales/API keys del cliente en cada proveedor (CRM, calendario, pasarela); CORS amigable (Web3Forms y Supabase ya lo son; Mercado Pago redirect no requiere backend). ⚠️ Guardrail: si el provider exige serverless, se evalúa redirección/link externo (ej. Checkout Pro en vez de procesamiento propio).
**Ejemplo:** nutricionista con formulario de "turno online" que crea evento en su calendario, notifica por email y guarda copia en Supabase.

### 3.3 Sitio en 2 idiomas — +40% del subtotal

**Qué es / función:** versión completa del sitio en un segundo idioma (contenido, navegación y SEO).
**Qué hace / aporta:** abre mercados (exportadores, turismo, audiencias bilingües) y mejora el SEO multilingüe (hreflang). Combina con: institucional, medida, landing.
**Procedimiento:** estructura de i18n (el repo hoy no tiene i18n — se reintroduce con routes per-idioma o selector con contexto) → traducción profesional de todo el copy → SEO dual (meta/hreflang/sitemap) → ajuste de layouts con texto más largo/corto.
**Complejidad: media-alta.** No es traducir: es re-arquitectar la presentación para que el idioma sea un eje del sitio.
**Requerimientos:** contenido traducido (o extra de redacción en 2 idiomas), decisión de dominio (subdirectorio `/en/` recomendado), hreflang y sitemap bilingüe.
**Ejemplo:** estudio de arquitectura (rubro "Profesionales") que vende a clientes del exterior: versión ES y EN con portfolio y contactos separados.

### 3.4 Diseño de logo / identidad — +USD 200

**Qué es / función:** pieza de marca (logo principal + variantes y paleta básica) para el sitio.
**Qué hace / aporta:** coherencia visual, profesionalismo y recordación; el sitio se ve terminado en vez de "plantilla con logo provisorio".
**Procedimiento:** brief de marca → referencias y moodboard → 2–3 propuestas → iteración → entrega de formatos (SVG/PNG, claro/oscuro) → integración al sitio.
**Complejidad: media (de oficio, no de código).** El costo es de diseño e iteración con el cliente.
**Requerimientos:** brief del cliente (rubro, estilo, referencias); herramientas de diseño; sin backend.
**Ejemplo:** emprendimiento de catering (rubro "Comercios y servicios") sin marca: logo + paleta aplicados a landing + WhatsApp con marca.

### 3.5 Redacción de textos (copy) — +USD 150

**Qué es / función:** redacción profesional del contenido del sitio (títulos, secciones, beneficios, FAQ) en el tono del proyecto.
**Qué hace / aporta:** el texto vende — mejora la conversión, la claridad y el SEO on-page; evita el "lo lleno yo después" que desluce el diseño.
**Procedimiento:** entrevista de negocio → estructura de mensajes → redacción en tono del sitio (segunda persona, concreto, sin promesas vacías — como el copy real del repo) → iteración → integración.
**Complejidad: baja–media.** No es desarrollo; requiere entender el negocio y escribir bien.
**Requerimientos:** información del negocio (servicios, diferenciales, público); sin backend.
**Ejemplo:** restaurante (rubro "Restaurantes y cafeterías") que no tiene textos de carta/menú: copy profesional de menú, horarios, reservas y FAQ.

### 3.6 Módulo de tienda online — +USD 600

**Qué es / función:** catálogo + carrito + checkout sobre un sitio existente (landing o institucional con sección de tienda). En el tier "medida" **está incluido** (el estimador lo deshabilita con nota "Incluido en este plan").
**Qué hace / aporta:** vender online sin marketplace (sin comisiones de plataforma, con la identidad propia), catálogo siempre actualizado.
**Procedimiento:** relevar catálogo y reglas (envío, stock, medios de pago) → modelo de datos (products, pedidos) → UI de catálogo/carrito → checkout con Mercado Pago (redirect) → panel de pedidos para el dueño → prueba de compra real.
**Complejidad: alta.** Es el extra más grande: datos, estados de pedido, integración de pago y panel.
**Requerimientos:** catálogo con fotos y precios, políticas de envío/cambios, cuenta de Mercado Pago del cliente, DB (Supabase), Storage para fotos de productos. ⚠️ Guardrail fair-use: checkout por redirección (Checkout Pro/link), no procesamiento propio; los pedidos pueden guardarse en Supabase como *gestión* si el volumen es personal/no comercial — validar antes de ofrecerlo a clientes que cobran (ver `fair-use.md`).
**Ejemplo:** gimnasio (rubro "Salud y bienestar") vendiendo planes y packs de clases online: catálogo, carrito y pago por Mercado Pago.

### 3.7 SEO técnico avanzado + analytics — +USD 100

**Qué es / función:** capa de optimización adicional sobre el SEO básico: schema.org (JSON-LD), optimización de rendimiento, analytics de tráfico y monitoreo de indexación.
**Qué hace / aporta:** visibilidad (más clicks orgánicos), datos de tráfico para decidir, y "tickets" técnicos resueltos (Lighthouse alto, sitemap fino, canonical/hreflang).
**Procedimiento:** auditoría técnica → implementación de schema por rubro (LocalBusiness, Service, FAQPage) → analytics (Vercel Analytics / GA4 / Plausible) → Search Console y sitemap → medición post-lanzamiento.
**Complejidad: baja–media.** Mayoría es configuración y markup; el único trabajo real es la auditoría y el seguimiento.
**Requerimientos:** dominio de producción estable (no un subdominio de prueba); cuenta de analytics y Search Console del cliente; contenido ya publicado.
**Ejemplo:** abogado (rubro "Profesionales y estudios") posicionando en búsqueda local: schema LegalService, página por especialidad, analytics para ver qué servicios buscan.

---

## 4. Tabla comparativa

| Servicio | Dónde se ofrece | Precio ref. | Plazo | Complejidad | Requisitos clave |
|----------|-----------------|-------------|-------|-------------|------------------|
| Landing page | Card pública + estimador | Desde USD 250 | 1–2 sem | Baja | Dominio, hosting, contenido |
| Sitio institucional | Card pública + estimador | Desde USD 450 | 2–4 sem | Media | Dominio, hosting, contenido x sección |
| E-commerce / a medida | Solo estimador | USD 1.200 | 4–8 sem | Alta | Supabase (DB/auth/RLS), integraciones, contenido/datos |
| Mantenimiento mensual | Chip informativo | A definir | Mensual | Baja | Acceso repo/deploy, acuerdo de alcance |
| Blog / CMS | Extra | +USD 150 | — | Media | Supabase (DB), auth editores, contenido |
| Formularios e integraciones | Extra | +USD 120 | — | Media | API keys de proveedores, CORS ok |
| Sitio en 2 idiomas | Extra | +40% subtotal | — | Media-alta | Contenido traducido, hreflang |
| Logo / identidad | Extra | +USD 200 | — | Media (diseño) | Brief de marca |
| Redacción de textos | Extra | +USD 150 | — | Baja–media | Info del negocio |
| Módulo de tienda | Extra (incluido en medida) | +USD 600 | — | Alta | Catálogo, MP, Supabase, políticas |
| SEO avanzado + analytics | Extra | +USD 100 | — | Baja–media | Dominio estable, analytics/Search Console |

---

## 5. Reglas cross-cutting del stack

| Necesidad | Cómo se resuelve (y cómo NO) |
|-----------|------------------------------|
| Formularios | Web3Forms (`FORM_ACCESS_KEY`) + copia a Supabase `contact_messages`. Nunca serverless propio. |
| Datos / DB | Supabase (Postgres + RLS). Todo client-side vía SDK. |
| Auth / roles | Supabase Auth + tabla `profiles` + RLS (`is_admin()`). Patrón ya implementado en `/admin` y `/panel`. |
| Pagos | Mercado Pago Checkout Pro / link de pago (redirección). Nunca procesar transacciones en serverless de este deploy. |
| Integraciones | Fetch client-side directo a la API del proveedor (CORS habilitado). Si exige backend → link externo o evaluación de plan Pro. |
| SEO | Meta runtime (`applySeoMeta`) + `robots.txt`/sitemap estáticos + JSON-LD en extras avanzados. |
| Deploy | `vercel.json` estático (build → `dist`, SPA rewrite, CSP). Cero functions. |
| Precios | Internos en `data/estimate.ts` (fuente única) + "desde" en `services.ts`. El presupuesto cerrado se da en la charla (paso 2 del proceso). |

---

## 6. Verificación de coherencia

- [x] `services.ts` ↔ `estimate.ts`: los precios "desde" de landing/institucional coinciden con los tiers del estimador.
- [x] Todos los extras tienen precio en `estimate.ts` y ficha acá.
- [x] Guardrails fair-use referenciados en cada requerimiento que toca backend.
- [x] Ejemplos basados en casos reales (`cases.ts`) y rubros reales (`industries.ts`).
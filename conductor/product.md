# Product Guide: Sitios web para estudios y oficios

## Vision

Sitio de servicios freelance de Gabriel Marrero para negocios de servicios en Argentina que viven de que los llamen: **estudios profesionales** (contadores, abogados, escribanos) y **oficios a domicilio** (electricistas, plomeros, gasistas). El sitio tiene que convertir una búsqueda local en un llamado o un mensaje, no solo “mostrar presencia”.

## Target Audience

- **Estudios profesionales:** dueños de estudios contables, jurídicos y escribanías, sin equipo de marketing, que dependen de consultas y recomendaciones.
- **Oficios a domicilio:** electricistas, plomeros y gasistas que consiguen trabajo por zona y necesitan que los encuentren y confíen rápido.
- **No es para todos:** tiendas o sistemas a medida se evalúan aparte; el sitio lo dice explícitamente.

## Goals

1. **Generar consultas calificadas:** que alguien que busca un servicio en su zona termine escribiendo o llamando.
2. **Comunicar valor, no disponibilidad:** nicho específico, transformación concreta, autoridad verificable, cupos reales (2 proyectos por mes).
3. **Vender con certeza:** presupuesto personalizado, alcance y plazo definidos, y reserva del cupo.

## Positioning

“Sitios para negocios de servicios que viven de que los llamen.”

- **Dolor:** “me buscan pero llaman a otro”; dependencia de Instagram o boca a boca; sitio viejo o que no se ve en el celular.
- **Transformación:** que te encuentren, confíen y llamen.
- **Mecanismo:** sitio rápido, mobile-first, con servicios, zona, prueba y contacto en un clic + SEO local básico.
- **Autoridad verificable:** Dranes en producción, SimpleHC en producción, Pasión Mundialista (login y pagos), este sitio con portal de clientes y panel.
- **Condiciones reales:** 2 proyectos por mes, presupuesto personalizado, ajustes hasta publicar.

## Core Sections

1. **Hero:** dolor + promesa + prueba en producción + CTA a WhatsApp.
2. **Problem:** la escena de búsqueda local en Google desde el celular.
3. **Services:** “Sitio de una página” (1–2 semanas) y “Sitio profesional completo” (2–4 semanas), con incluye y qué necesita del cliente; sin precios públicos.
4. **Cases:** Dranes, SimpleHC y Pasión Mundialista, con contexto, rol y resultado; sin testimonios inventados.
5. **About:** trato directo, prueba verificable, portal de seguimiento y cupos.
6. **Benefits:** “por qué conmigo”, no “por qué tener un sitio”.
7. **Industries:** dos grupos foco (estudios y oficios), sin listas infinitas.
8. **Process:** charla → presupuesto personalizado → desarrollo con panel → publicación y capacitación.
9. **Estimator:** solicitud de presupuesto con tier, secciones, extras, plazo estimado, nombre, email, notas y consentimiento; sin precios. El owner recibe el lead y responde con un presupuesto a medida por email.
10. **FAQ, CTA y Contact:** objeciones, cierre y formulario/WhatsApp.

## Look & Feel

- Dark & Modern, Tailwind 4, mobile-first, accesible y rápido.
- Copy en español rioplatense, segunda persona, frases cortas, sin promesas vacías.
- Una sola fuente de texto: `src/data/copy.ts`; datos de servicios en `src/data/services.ts`.

## Success Indicators

- Un visitante entiende en el hero a quién le habla el sitio y qué gana.
- Puede ver prueba real (Dranes/SimpleHC) y abrirla en un clic.
- Puede solicitar un presupuesto a medida por formulario o WhatsApp sin ver precios públicos.
- El mensaje no promete resultados de tráfico/ventas que no se puedan controlar.

## Implementation Status

- **Posicionamiento actualizado (2026-10-24):** nicho estudios + oficios, cupos 2/mes, presupuesto personalizado y prueba en producción. Sin precios públicos.
- **Solicitud de presupuesto (2026-10-24):** formulario de brief + email + consentimiento; el owner recibe el lead por email y responde manualmente. Panel `/admin/presupuestos`; páginas de privacidad y términos.
- **Verificado 2026-10-24:** 616 tests passing, lint 0 errors/0 warnings, typecheck OK, `npm run build` OK.
- **Producción:** https://gabrielmarrero.com.ar (repo: https://github.com/gbmarr/portfolio-react). Contenido solo en español.
- **Pendiente:** revisión legal, aplicar migración 0018, desplegar `contact-notify`, E2E real, re-verificar Lighthouse y evaluar code-splitting (bundle principal >500 kB).

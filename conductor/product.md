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
3. **Vender con certeza:** presupuesto cerrado en 48 h, alcance y plazo definidos, 50% para reservar el cupo.

## Positioning

“Sitios para negocios de servicios que viven de que los llamen.”

- **Dolor:** “me buscan pero llaman a otro”; dependencia de Instagram o boca a boca; sitio viejo o que no se ve en el celular.
- **Transformación:** que te encuentren, confíen y llamen.
- **Mecanismo:** sitio rápido, mobile-first, con servicios, zona, prueba y contacto en un clic + SEO local básico.
- **Autoridad verificable:** Dranes en producción, SimpleHC en producción, Pasión Mundialista (login y pagos), este sitio con portal de clientes y panel.
- **Condiciones reales:** 2 proyectos por mes, presupuesto cerrado, ajustes hasta publicar.

## Core Sections

1. **Hero:** dolor + promesa + prueba en producción + CTA a WhatsApp.
2. **Problem:** la escena de búsqueda local en Google desde el celular.
3. **Services:** “Sitio de una página” (USD 350, 1–2 semanas) y “Sitio profesional completo” (USD 600, 2–4 semanas), con incluye y qué necesita del cliente.
4. **Cases:** Dranes, SimpleHC y Pasión Mundialista, con contexto, rol y resultado; sin testimonios inventados.
5. **About:** trato directo, prueba verificable, portal de seguimiento y cupos.
6. **Benefits:** “por qué conmigo”, no “por qué tener un sitio”.
7. **Industries:** dos grupos foco (estudios y oficios), sin listas infinitas.
8. **Process:** charla → presupuesto cerrado en 48 h → desarrollo con panel → publicación y capacitación.
9. **Estimator:** rango orientativo client-side; tiers 350 / 600 / 1200 y extras.
10. **FAQ, CTA y Contact:** objeciones, cierre y formulario/WhatsApp.

## Look & Feel

- Dark & Modern, Tailwind 4, mobile-first, accesible y rápido.
- Copy en español rioplatense, segunda persona, frases cortas, sin promesas vacías.
- Una sola fuente de texto: `src/data/copy.ts`; datos de servicios en `src/data/services.ts`.

## Success Indicators

- Un visitante entiende en el hero a quién le habla el sitio y qué gana.
- Puede ver prueba real (Dranes/SimpleHC) y abrirla en un clic.
- Puede pedir un presupuesto cerrado por WhatsApp o formulario sin fricción.
- El mensaje no promete resultados de tráfico/ventas que no se puedan controlar.

## Implementation Status

- **Posicionamiento actualizado (2026-10-24):** nicho estudios + oficios, precios 350/600/1200, cupos 2/mes, presupuesto cerrado en 48 h y prueba en producción.
- **Verificado 2026-10-24:** 542 tests passing, lint 0 errors/0 warnings, typecheck OK, `npm run build` OK.
- **Producción:** https://gabrielmarrero.com.ar (repo: https://github.com/gbmarr/portfolio-react). Contenido solo en español.
- **Pendiente:** re-verificar Lighthouse contra producción y evaluar code-splitting (bundle principal >500 kB).

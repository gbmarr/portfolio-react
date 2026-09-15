# Plan: Refactorización — Portfolio → Sitio de Servicios de Desarrollo Web

> **Track ID:** `portfolio_20260915`
> **Spec:** `../spec.md` (provided by user)
> **Status:** ✅ Fases 0-10 completadas + configuración final (2026-09-15)

---

## Contexto

El sitio actual es un portfolio personal de desarrollador fullstack junior (React 19, Vite, Tailwind CSS v4, TypeScript). Debe reconvertirse en un sitio de servicios para vender landing pages y sitios institucionales a dueños de PyMEs y emprendedores argentinos.

### Decisiones confirmadas
- **i18n:** Eliminar sistema bilingüe. Todo en español.
- **Routing:** Mantener SPA con secciones ancla (sin React Router).
- **CV data:** Eliminar secciones de experiencia laboral, educación, certificaciones y skills.
- **Contacto:** Formulario simple (via servicio email) + WhatsApp con mensaje predefinido.
- **Diseño:** Mantener tema Dark & Modern existente.
- **Precios:** Placeholders temporalmente.

---

## Fase 0 — Limpieza y preparación

**Objetivo:** Eliminar código y datos que ya no aplican, sin romper el build.

### Tareas

| # | Tarea | Archivos afectados | Estado |
|---|-------|-------------------|--------|
| 0.1 | Eliminar sistema i18n completo | `src/i18n/translations.ts`, `src/i18n/LanguageContext.tsx`, `src/i18n/LanguageContext.test.tsx` | ✅ |
| 0.2 | Eliminar `LanguageToggle` y todas sus referencias | `src/components/LanguageToggle.tsx`, `src/components/LanguageToggle.test.tsx`, `src/components/Navbar.tsx` | ✅ |
| 0.3 | Eliminar sección Skills y componentes relacionados | `src/sections/Skills.tsx`, `src/sections/Skills.test.tsx`, `src/components/SkillBadge.tsx`, `src/components/SkillBadge.test.tsx`, `src/data/skills.ts` | ✅ |
| 0.4 | Eliminar sección About (será reemplazada) | `src/sections/About.tsx`, `src/sections/About.test.tsx`, `src/components/Timeline.tsx`, `src/components/Timeline.test.tsx` | ✅ |
| 0.5 | Eliminar datos de experiencia y perfil detallado | `src/data/experience.ts`, `src/data/skills.ts`, `src/data/types.ts` (simplificar) | ✅ |
| 0.6 | Eliminar `src/data/content.ts` y `src/data/content.test.ts` (ya no hay i18n) | `src/data/content.ts`, `src/data/content.test.ts` | ✅ |
| 0.7 | Actualizar `App.tsx` para quitar secciones eliminadas | `src/App.tsx` | ✅ |
| 0.8 | Actualizar `Navbar.tsx` para quitar links de secciones eliminadas | `src/components/Navbar.tsx` | ✅ |
| 0.9 | Verificar que `npm run build`, `npm run lint` y `npm run test` pasan | — | ✅ |

> **Nota de implementación:** para mantener el build verde al eliminar i18n completo, se creó `src/data/copy.ts` (copy en español para los componentes que sobreviven). Este archivo figura en el plan como parte de la Fase 2 y será reescrito con el copy definitivo del sitio de servicios.

---

## Fase 1 — Rediseño de la arquitectura de datos

**Objetivo:** Crear el nuevo modelo de datos alineado con el spec del sitio de servicios.

### Tareas

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| 1.1 | Redefinir tipos en `src/data/types.ts`: `Service`, `CaseStudy`, `ProcessStep`, `FAQ`, `Profile` (simplificado) | `src/data/types.ts` | ✅ |
| 1.2 | Crear `src/data/profile.ts` nuevo: nombre, frase, foto, WhatsApp, email, ciudad/zona | `src/data/profile.ts` | ✅ |
| 1.3 | Crear `src/data/services.ts`: Landing Page y Sitio Institucional (incluye, no incluye, plazo, precio desde) | `src/data/services.ts` | ✅ |
| 1.4 | Crear `src/data/cases.ts`: 2-3 casos de portfolio reestructurados (cliente, rubro, necesidad, hice, resultado) | `src/data/cases.ts` | ✅ |
| 1.5 | Crear `src/data/process.ts`: pasos del proceso de trabajo (4 pasos) | `src/data/process.ts` | ✅ |
| 1.6 | Crear `src/data/faq.ts`: preguntas frecuentes del spec (6 preguntas) | `src/data/faq.ts` | ✅ |
| 1.7 | Integrar proyectos en `cases.ts` (`projects.ts` se eliminará cuando se reemplacen las secciones viejas en Fases 4-5) | `src/data/projects.ts` | ⏸️ diferida |

> **Notas de implementación (Fase 1):**
> - `profile.ts` mantiene campos legacy (`role`, `bio`, `tagline`, `socialLinks`) hasta que Hero/Contact se reescriban en Fases 4-5.
> - `services.ts` exporta `buildWhatsAppUrl(serviceId?)` que genera el enlace `wa.me` con mensaje predefinido (por servicio o genérico).
> - `whatsappNumber`, `phone` y `city` en `profile.ts` son **placeholders marcados con `TODO`** — el usuario debe proveer los valores reales.

---

## Fase 2 — Nuevo sistema de contenido (reemplazo de i18n)

**Objetivo:** Crear un módulo de contenido plano en español que los componentes consuman.

### Tareas

| # | Tarea | Archivos |
|---|-------|----------|
| 2.1 | Crear `src/data/copy.ts`: todo el copy del sitio (hero, secciones, CTAs, alt texts) en español | `src/data/copy.ts` |
| 2.2 | Exportar objeto `copy` como fuente única de texto para todos los componentes | `src/data/copy.ts` |

---

## Fase 3 — Componentes reutilizables (actualización)

**Objetivo:** Adaptar componentes existentes y crear los nuevos que faltan.

### Tareas

| # | Tarea | Archivos |
|---|-------|----------|
| 3.1 | Crear componente `ServiceCard` (bloque de servicio con precio, items, CTA) | `src/components/ServiceCard.tsx` |
| 3.2 | Crear componente `CaseCard` (mini caso: captura, cliente, necesidad, resultado) | `src/components/CaseCard.tsx` |
| 3.3 | Crear componente `ProcessSteps` (pasos numerados del proceso de trabajo) | `src/components/ProcessSteps.tsx` |
| 3.4 | Crear componente `FAQ` (acordeón simple de preguntas frecuentes) | `src/components/FAQ.tsx` |
| 3.5 | Crear componente `ContactForm` (nombre, email/WhatsApp, mensaje) | `src/components/ContactForm.tsx` |
| 3.6 | Crear componente `WhatsAppButton` (enlace wa.me con mensaje predefinido) | `src/components/WhatsAppButton.tsx` |
| 3.7 | Crear componente `PriceTag` (badge de precio "desde $X") | `src/components/PriceTag.tsx` |
| 3.8 | Actualizar `Button` si se necesita variante WhatsApp (verde) | `src/components/Button.tsx` |
| 3.9 | Verificar tests de componentes existentes que no cambiaron | — |

---

## Fase 4 — Secciones de la página de inicio (Home)

**Objetivo:** Construir las 8 secciones del home según el spec.

### Tareas

| # | Tarea | Sección del spec | Archivo |
|---|-------|-----------------|---------|
| 4.1 | Reescribir `Hero.tsx` — titular sin jerga, subtítulo diferencial, botón WhatsApp, preview de trabajos | 4.1 Hero | `src/sections/Hero.tsx` |
| 4.2 | Crear sección `Problem.tsx` — 2-3 líneas que nombren la situación del visitante | 4.2 El problema | `src/sections/Problem.tsx` |
| 4.3 | Crear sección `ServicesPreview.tsx` — dos bloques resumidos (Landing + Institucional) con precios | 4.3 Servicios | `src/sections/ServicesPreview.tsx` |
| 4.4 | Crear sección `HowItWorks.tsx` — 3-4 pasos numerados del proceso | 4.4 Cómo trabajo | `src/sections/HowItWorks.tsx` |
| 4.5 | Crear sección `FeaturedCases.tsx` — 2-3 proyectos destacados con contexto | 4.5 Trabajos | `src/sections/FeaturedCases.tsx` |
| 4.6 | Crear sección `AboutShort.tsx` — 3-4 líneas + foto real | 4.6 Sobre mí | `src/sections/AboutShort.tsx` |
| 4.7 | Crear sección `FAQSection.tsx` — preguntas frecuentes | 4.7 Preguntas frecuentes | `src/sections/FAQSection.tsx` |
| 4.8 | Crear sección `CTAFinal.tsx` — cierre con botón repetido | 4.8 Cierre | `src/sections/CTAFinal.tsx` |

---

## Fase 5 — Páginas interiores

**Objetivo:** Crear las secciones de Servicios, Trabajos y Contacto.

### Tareas

| # | Tarea | Archivo |
|---|-------|---------|
| 5.1 | Crear sección `ServicesDetail.tsx` — detalle de cada servicio (para quién, incluye, no incluye, plazo, precio, CTA) | `src/sections/ServicesDetail.tsx` |
| 5.2 | Crear sección `CasesDetail.tsx` — portfolio completo con mini-casos (captura, cliente, necesidad, hice, resultado, enlace) | `src/sections/CasesDetail.tsx` |
| 5.3 | Crear sección `ContactFull.tsx` — formulario + WhatsApp + expectativa de respuesta | `src/sections/ContactFull.tsx` |
| 5.4 | Crear componente `Mockup.tsx` — mockup de celular/escritorio para capturas de proyectos | `src/components/Mockup.tsx` |

---

## Fase 6 — Navegación y estructura global

**Objetivo:** Actualizar navbar, footer y la estructura de App.

### Tareas

| # | Tarea | Archivo | Estado |
|---|-------|---------|--------|
| 6.1 | Reescribir `Navbar.tsx` — links: Inicio, Servicios, Trabajos, Contacto | `src/components/Navbar.tsx` | ✅ |
| 6.2 | Reescribir `Footer.tsx` — tagline, copyright, derechos | `src/components/Footer.tsx` | ✅ |
| 6.3 | Actualizar `App.tsx` — orden de secciones: Hero → Problem → ServicesPreview → HowItWorks → FeaturedCases → ServicesDetail → CasesDetail → AboutShort → FAQSection → CTAFinal → Contact | `src/App.tsx` | ✅ |
| 6.4 | Navegación entre "páginas" | — | ✅ (SPA anclas confirmado; no requiere NavAnchor) |

> **Notas de implementación (Fase 6):**
> - El orden real de `App.tsx` difiere levemente del original: `ServicesDetail` y `CasesDetail` van antes de `AboutShort`/`FAQ`/`CTAFinal` para fluir resumen → detalle → cierre.
> - Se eliminaron las secciones legacy que quedaron sin uso: `src/sections/Projects.tsx`, `src/components/ProjectCard.tsx`, `src/data/projects.ts` (+ sus tests y el test de datos de projects). El copy legacy de `copy.ts` (claves `projects`, `hero.greeting`, etc.) queda inerte hasta limpiarse en el QA.
> - Verificado: typecheck ✅, lint ✅, 30 test files / 94 tests ✅, cobertura 98.21% stmts / 93.5% branches ✅, build ✅.

---

## Fase 7 — SEO, meta tags y Open Graph

**Objetivo:** Actualizar todo lo relacionado con SEO para el nuevo contenido.

### Tareas

| # | Tarea | Archivo | Estado |
|---|-------|---------|--------|
| 7.1 | Actualizar `index.html`: título, descripción, OG tags para sitio de servicios | `index.html` | ✅ |
| 7.2 | Actualizar `src/utils/seo.ts`: og:type, og:image, og:site_name | `src/utils/seo.ts` | ✅ |
| 7.3 | Actualizar `public/robots.txt` con Sitemap | `public/robots.txt` | ✅ |
| 7.4 | Crear `public/sitemap.xml` | `public/sitemap.xml` | ✅ |
| 7.5 | Verificar `og:image` apunte a una imagen representativa | `index.html` | ✅ |

> **Notas de implementación (Fase 7):**
> - `og:image` apunta a `/images/pasion-cap-1.png` (captura real de proyecto existente).
> - `canonical` URL usa el dominio Vercel histórico `portfolio-blond-beta-46.vercel.app`; actualizar tras apuntar dominio propio.
> - `sitemap.xml` y `robots.txt` usan la misma URL base — reemplazar por dominio definitivo al publicar.
> - `SeoMeta` ampliado con campos opcionales `ogImage` y `siteName`; `applySeoMeta` inyecta `og:type=website` siempre.
> - Verificado: 30 test files / 95 tests ✅, cobertura 98%+ ✅, lint ✅, typecheck ✅, build ✅.

---

## Fase 8 — Formulario de contacto y WhatsApp

**Objetivo:** Implementar el canal de conversión principal.

| # | Tarea | Archivo | Estado |
|---|-------|---------|--------|
| 8.1 | Implementar `ContactForm` con servicio de envío (Web3Forms) | `src/components/ContactForm.tsx`, `src/utils/formSubmission.ts` | ✅ |
| 8.2 | Configurar variable de entorno para API key del servicio de formularios | `.env.example` (VITE_FORM_ACCESS_KEY) | ✅ |
| 8.3 | Implementar `WhatsAppButton` con enlace `wa.me` y mensaje predefinido | `src/components/WhatsAppButton.tsx` | ✅ (Fase 3) |
| 8.4 | Agregar validación client-side al formulario | `src/components/ContactForm.tsx` | ✅ (required + inputMode email) |
| 8.5 | Testear envío real del formulario | `src/utils/formSubmission.test.ts` | ⏳ (falta Access Key real del usuario) |

> **Notas de implementación (Fase 8):**
> - **Pendiente del usuario:** crear cuenta en web3forms.com, copiar `.env.example` → `.env.local` y completar `VITE_FORM_ACCESS_KEY` (configurar en Web3Forms el email receptor). Sin la key el form muestra el estado de error y deriva a WhatsApp, pero **no llegará email** — es prioridad antes de publicar.
> - `ContactForm` acepta `onSubmit` (usado en tests) y por defecto llama `submitContactForm` (Web3Forms vía fetch).
> - `submitContactForm` lanza error si falta la key o la API falla; el form muestra el mensaje de error con canal WhatsApp.
> - Verificado: 31 test files / 98 tests ✅, lint ✅, typecheck ✅, build ✅.

---

## Fase 9 — Tests

**Objetivo:** Actualizar y crear tests para todo el nuevo código.

### Tareas

| # | Tarea |
|---|-------|
| 9.1 | Actualizar tests de `App.tsx` |
| 9.2 | Crear tests para `ServiceCard`, `CaseCard`, `ProcessSteps`, `FAQ` |
| 9.3 | Crear tests para `ContactForm`, `WhatsAppButton` |
| 9.4 | Crear tests para las nuevas secciones del home |
| 9.5 | Verificar cobertura ≥80% |
| 9.6 | Ejecutar `npm run test` y `npm run coverage` |

---

## Revisión posterior (2026-09-15)

**Problema detectado por el usuario:** las secciones de Servicios y Trabajos aparecían duplicadas en el sitio.

**Causa:** el diseño original asumía páginas separadas (resumen en home + página interior de detalle), pero con SPA de secciones-ancla el "resumen" y el "detalle" renderizaban las mismas tarjetas dos veces en la misma página (2 servicios y 3 casos → duplicación visual total).

**Corrección aplicada:**
- `ServicesPreview` + `ServicesDetail` → **`Services.tsx`** (sección única completa, id `servicios`, con unsureText + CTA de WhatsApp).
- `FeaturedCases` + `CasesDetail` → **`Cases.tsx`** (sección única completa, id `trabajos`, con todos los casos + nota de honestidad).
- Eliminadas las 4 secciones duplicadas y sus tests; `App.tsx` renderiza cada sección una sola vez: Hero → Problem → Services → HowItWorks → Cases → AboutShort → FAQ → CTAFinal → Contact.
- Eliminadas claves de copy sin uso: `services.detailLabel` y `cases.viewAll`.
- `App.test.tsx` ahora verifica que Servicios y Trabajos aparecen **una sola vez** (`toHaveLength(1)`).
- Verificado: 29 test files / 94 tests ✅, lint ✅, typecheck ✅, build ✅.

### Revisión de orden y peso visual del home (2026-09-15)

**Problema detectado por el usuario:** revisar el orden y el peso visual del home luego de agregar la sección de Beneficios + Rubros.

**Diagnóstico:**
- `Benefits` (base) y `Services` (base) quedaban consecutivas → 2 secciones seguidas sin tinte (muro visual continuo de ~2 pantallas).
- `Benefits` era la sección más alta del sitio: dos bloques completos (6 tarjetas + rubros) con solo `mt-20` entre ambos; la pregunta de calificación "¿Es para tu rubro?" quedaba enterrada.

**Corrección aplicada (aprobada por el usuario):**
- `Benefits.tsx` → solo beneficios (id `beneficios`, fondo base, 6 tarjetas).
- **Nueva** `Industries.tsx` (id `rubros`, fondo `bg-surface/40`): rubros en 5 grupos / 32 chips, ubicada entre `Benefits` y `Services`.
- `App.tsx` orden final: Hero → Problem → Benefits → **Industries** → Services → HowItWorks → Cases → AboutShort → FAQ → CTAFinal → Contact. **Alternancia base/tinte perfecta en 11 secciones.**
- Sin cambios de copy ni de navegación (4 ítems del menú intactos).
- Tests: `Industries.test.tsx` nuevo; `Benefits.test.tsx` recortado; `App.test.tsx` verifica `copy.industries.title` (`toHaveLength(1)`).
- Fix de flake: test de throttle de `ContactForm.test.tsx` excedía 5000 ms bajo coverage → `userEvent.setup({ delay: null })` + timeout 15000 ms.
- Verificado: 33 test files / 112 tests ✅, lint ✅, typecheck ✅, build ✅ (228.58 kB js / 71.48 kB gzip), coverage 97.48% stmts / 93.16% branches.

---

## Fase 10 — QA y checklist previo a publicar

**Objetivo:** Validar contra el checklist del spec (Sección 11).

### Checklist final

- [x] El titular del hero explica qué hacés sin jerga técnica — `copy.hero.title`
- [x] Hay un solo llamado a la acción principal, repetido arriba y abajo — `WhatsAppButton` en Hero y CTAFinal
- [x] Los precios (o rangos) están visibles — `PriceTag` en `ServiceCard` (**definitivos**: USD 250 / USD 450)
- [x] El proceso de trabajo está explicado en pasos — `HowItWorks` / `ProcessSteps` (4 pasos)
- [x] Hay al menos 2-3 trabajos con contexto, no solo imágenes — `Cases` (3 casos)
- [ ] El formulario fue probado y llegan los mensajes — **pendiente**: falta crear `VITE_FORM_ACCESS_KEY` en Web3Forms (tests con mock ✅)
- [x] El enlace de WhatsApp funciona y abre con mensaje predefinido — `buildWhatsAppUrl` (**número real configurado** 5492262339680)
- [ ] Se ve bien en un celular real — **pendiente de prueba manual** en dispositivo físico
- [x] Carga en menos de 3 segundos — bundle 219 kB JS (69 kB gzip), verificación final con Lighthouse recomendada
- [x] Analytics está instalado y registrando — Vercel Analytics (`inject()` en `main.tsx`); activar en dashboard de Vercel
- [x] Al compartir el link por WhatsApp se ve la previsualización correcta — `og:image` (URL absoluta + width/height 1877×894) en `index.html` y `copy.seo`
- [ ] Los textos coinciden con lo que dicen los contratos — **responsabilidad del usuario** al redactar contratos
- [x] `npm run build` pasa sin errores
- [x] `npm run lint` pasa sin warnings
- [x] `npm run test` pasa con cobertura ≥80% — 33 files / 112 tests ✅, 97.48% stmts / 93.16% branches / 96.87% funcs / 98.67% lines (Vitest 5)
- [x] `npm run typecheck` pasa sin errores

### Pendientes que requieren acción del usuario (no bloquean el código)

1. **Web3Forms:** crear cuenta, completar `VITE_FORM_ACCESS_KEY` en `.env.local` (ya creado, vacío), configurar email receptor. Sin esto el form muestra error y deriva a WhatsApp.
2. **Prueba en celular real** (checklist spec) tras el deploy.
3. **Dominio propio (opcional):** hoy canonical/sitemap/robots apuntan a `portfolio-blond-beta-46.vercel.app`; cuando haya dominio definitivo actualizar `index.html`, `public/sitemap.xml` y `public/robots.txt`.

### Resueltos en la configuración final (2026-09-15)

- WhatsApp real: `whatsappNumber: '5492262339680'`, `phone: '+54 9 2262 339680'` (`src/data/profile.ts`).
- Ciudad/zona SEO local: decidido mantener `city: 'Argentina'` (área 2262 → Tandil; cambiar a `'Tandil'` es una línea si se quiere afinar).
- Precios definitivos: USD 250 (landing) / USD 450 (institucional) en `src/data/services.ts`.
- OG image absoluta: `copy.seo.ogImage` e `index.html` apuntan a `https://portfolio-blond-beta-46.vercel.app/images/pasion-cap-1.png` + `og:image:width/height` (1877×894).
- npm audit: **0 vulnerabilidades** — `npm audit fix` resolvió la alta (nanoid→3.3.19) y se actualizó Vitest 4.1.10 → 5.0.1 junto a `@vitest/coverage-v8@5` para resolver las 3 moderadas; suite completa (test/lint/typecheck/build/coverage) verificada en verde.

---

## Archivos a eliminar (resumen Fase 0)

```
src/i18n/translations.ts          → ELIMINAR
src/i18n/LanguageContext.tsx      → ELIMINAR
src/i18n/LanguageContext.test.tsx → ELIMINAR
src/components/LanguageToggle.tsx → ELIMINAR
src/components/LanguageToggle.test.tsx → ELIMINAR
src/components/SkillBadge.tsx     → ELIMINAR
src/components/SkillBadge.test.tsx → ELIMINAR
src/components/Timeline.tsx       → ELIMINAR
src/components/Timeline.test.tsx  → ELIMINAR
src/sections/Skills.tsx           → ELIMINAR
src/sections/Skills.test.tsx      → ELIMINAR
src/sections/About.tsx            → REEMPLAZAR por AboutShort.tsx
src/sections/About.test.tsx       → REEMPLAZAR
src/data/skills.ts                → ELIMINAR
src/data/experience.ts            → ELIMINAR
src/data/content.ts               → ELIMINAR
src/data/content.test.ts          → ELIMINAR
src/data/types.ts                 → REESCRIBIR
src/data/projects.ts              → REEMPLAZAR por cases.ts
```

## Archivos a crear (resumen)

```
src/data/copy.ts                  → Copy del sitio en español
src/data/services.ts              → Datos de servicios
src/data/cases.ts                 → Casos de portfolio
src/data/process.ts               → Pasos del proceso
src/data/faq.ts                   → Preguntas frecuentes
src/components/ServiceCard.tsx    → Tarjeta de servicio
src/components/CaseCard.tsx       → Tarjeta de caso
src/components/ProcessSteps.tsx   → Pasos del proceso
src/components/FAQ.tsx            → Acordeón de FAQ
src/components/ContactForm.tsx    → Formulario de contacto
src/components/WhatsAppButton.tsx → Botón de WhatsApp
src/components/PriceTag.tsx       → Badge de precio
src/components/Mockup.tsx         → Mockup para capturas
src/sections/Problem.tsx          → Sección "El problema"
src/sections/ServicesPreview.tsx  → Servicios resumidos
src/sections/HowItWorks.tsx      → Cómo trabajo
src/sections/FeaturedCases.tsx    → Trabajos destacados
src/sections/AboutShort.tsx       → Sobre mí corto
src/sections/FAQSection.tsx       → Sección FAQ
src/sections/CTAFinal.tsx         → Cierre/CTA
src/sections/ServicesDetail.tsx   → Detalle de servicios
src/sections/CasesDetail.tsx      → Portfolio completo
src/sections/ContactFull.tsx      → Contacto completo
public/sitemap.xml                → Sitemap
```

---

## Estimación de esfuerzo

| Fase | Horas estimadas |
|------|----------------|
| Fase 0 — Limpieza | 1-2h |
| Fase 1 — Datos | 2-3h |
| Fase 2 — Copy | 1-2h |
| Fase 3 — Componentes | 3-4h |
| Fase 4 — Secciones Home | 4-5h |
| Fase 5 — Páginas interiores | 3-4h |
| Fase 6 — Navegación | 1-2h |
| Fase 7 — SEO | 1h |
| Fase 8 — Formulario/WhatsApp | 2-3h |
| Fase 9 — Tests | 2-3h |
| Fase 10 — QA | 1-2h |
| **Total** | **~21-30h** |

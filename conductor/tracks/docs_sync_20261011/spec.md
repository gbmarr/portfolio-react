# Spec — Sincronizar documentación de producto

> **Track ID:** `docs_sync_20261011`
> **Fuente:** Gap 4 del reporte de aptitud MVP/v1 (análisis 2026-10-11).
> **Estado:** 🔜 Pendiente (spec + plan aprobados).

---

## 1. Contexto y objetivo

La documentación en `conductor/` quedó detrás del pivot del proyecto (portfolio → sitio de servicios web + sistema de gestión):

- `conductor/product-guidelines.md` exige en la sección **Language**: "Bilingual (ES/EN): All content is available in Spanish and English with a language toggle" y "Default language based on visitor's browser language". Pero `src/data/copy.ts` (línea 1) declara: `// Fuente única de texto del sitio (solo español)`. No existe toggle de idioma.
- `conductor/product.md` dice "All 6 implementation phases complete (scaffolding, content model, design system, core sections, bilingual + SEO, QA)" (menciona lo bilingüe), cita Lighthouse scores y una URL de deploy vieja (`portfolio-blond-beta-46.vercel.app`). El dominio canónico actual es `https://gabrielmarrero.com.ar` (verificado, responde 200 el 2026-10-11).

**Objetivo:** que `product.md` y `product-guidelines.md` describan el producto real: español único, dominio canónico, y estados verificables.

## 2. Functional Requirements

- **FR1 — product-guidelines.md (Language):** reemplazar el requisito bilingüe por "Español como idioma único del sitio (decisión de producto). El copy vive en `src/data/copy.ts` como fuente única".
- **FR2 — product-guidelines.md (accesibilidad):** mantener el resto (semántica HTML, alt, menús por teclado, CTA claros) sin cambios salvo quitar referencias a "both languages".
- **FR3 — product.md (estado):** actualizar la sección "Implementation Status" para reflejar el estado 2026-10-11: MVP/v1 completa, verificada (416 tests, cobertura 92.7%, lint 0 errores, build OK) y en producción en `gabrielmarrero.com.ar`.
- **FR4 — product.md (URLs):** corregir el dominio de producción y el repo (repo actual: `gbmarr/portfolio-react`).
- **FR5 — product.md (Lighthouse):** no inventar números nuevos. Los scores citados quedan marcados como "medidos el 2026-08-01 en release previo; reverificar" o se omiten si no se pueden confirmar hoy.
- **FR6 — Sin tocar código:** cambios solo en `conductor/product.md` y `conductor/product-guidelines.md` (u otros docs de producto si el análisis revela más desfase).

## 3. Non-Functional Requirements

- **NFR1 —** Idioma español, consistente con el repo y resto de `conductor/`.
- **NFR2 —** No duplicar contenido que ya viva en tech-stack.md/tracks.md (enlazar).
- **NFR3 —** Sin impacto en código, tests ni deploy.

## 4. Acceptance Criteria

- [ ] `product-guidelines.md` ya no menciona toggle ES/EN ni "both languages".
- [ ] `product.md` apunta a `gabrielmarrero.com.ar`, sin la URL vieja de Vercel ni datos no verificables como fresh.
- [ ] El resto de la documentación de producto no contradice el código actual (chequeo manual de referencias a bilingüe).
- [ ] `npm run typecheck` / `npm run lint` / `npm run test` siguen verdes (no aplica build: solo docs).

## 5. Out of Scope

- Reescritura completa de la doc de producto (README.md → track `readme_docs_20261011`).
- Añadir bilingüe como feature futuro (requiere decisión de producto, no un track de docs).
- Actualización de `conductor/servicios.md` salvo que el chequeo manual muestre desfase de precios/copy.
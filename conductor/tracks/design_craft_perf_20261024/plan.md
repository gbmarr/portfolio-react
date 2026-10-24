# Plan — Craft de interfaz y peso de la página

**Track:** `design_craft_perf_20261024`
**Spec:** [./spec.md](./spec.md)

## Fase 0 — Fundamentos (`src/index.css`)

- [x] Tokens de easing (`--ease-out`, `--ease-in-out`, `--ease-drawer`) y `--color-accent-hover`.
- [x] `@custom-variant hover-fine` para hover real.
- [x] `scroll-padding-top: 5rem` (los anchors aterrizaban debajo del navbar).
- [x] `scroll-behavior: smooth` solo bajo `prefers-reduced-motion: no-preference`.
- [x] Bloque global de `prefers-reduced-motion: reduce` (reduce, no elimina).
- [x] Quitar `textarea { resize: none }` global.
- [x] Acordeón nativo animado con `::details-content` + `interpolate-size`.
- [x] `@font-face` self-hosted de Inter y Space Grotesk (subset latin, variables).

## Fase 1 — Peso de la página

- [x] `src/routes/PrivateRoutes.tsx`: `AuthProvider` + rutas privadas en un chunk lazy.
- [x] `AppRouter` queda con `/` y un catch-all lazy.
- [x] `scripts/optimize-images.mjs` (`npm run images:optimize`): WebP por ancho real, OG 1200×630, `apple-touch-icon`.
- [x] Originales movidos a `assets/images-src/` (fuera del deploy) y PNGs sin uso fuera de `public/`.
- [x] `Mockup` acepta `srcSet`; `cases.ts` declara variantes 190w/380w/760w.
- [x] `width`/`height` en la foto de perfil.
- [x] `theme-color` y `apple-touch-icon` en `index.html`.
- [x] OG image corregida (declaraba 1877×894 para un archivo de 425×873).

## Fase 2 — Craft de componentes públicos

- [x] `Reveal`: `transition-[opacity,transform]` 260 ms, `translate-y-4`, delay real.
- [x] `useScrollReveal`: chequeo sincrónico de viewport antes del observer.
- [x] Stagger 60 ms en `Services`, `Benefits` y `Cases`.
- [x] `Button`: `active:scale-[0.97]`, hover que aclara, ancla deshabilitada = `<button disabled>`, `size` (`md`/`sm`).
- [x] `Navbar`: menú móvil siempre montado con `grid-rows`, Escape + retorno de foco, `aria-current` con scroll-spy, elevación al scrollear.
- [x] `FAQ`: `focus-visible`, reset del marker de Safari.
- [x] `IndustryChip`: `transform-origin` según el arrow, `scale(0.97)`, `pointer-events-none`, modo instantáneo entre tooltips.
- [x] `ServiceCard` / `BenefitCard` / `CaseCard`: propiedades explícitas, hover gateado, glow sin transición.

## Fase 3 — Accesibilidad y panel

- [x] Contraste del footer (`text-text-muted` pleno).
- [x] `Loading` y `RouteFallback` con `motion-safe` / `motion-reduce`.
- [x] Estimador: `tabular-nums` + `aria-live` con debounce de 400 ms.
- [x] Barra de progreso del cliente con `scaleX` en vez de `width`.
- [x] `ContactForm` usa `fieldClasses` compartido; textarea `resize-y`.
- [x] `MessagesPage`: acordeón animado, punto de no leído con texto `sr-only`, `focus-visible` en acciones.
- [x] Botones del panel unificados sobre `Button` / `buttonClasses`.

## Fase 4 — Verificación

- [x] `npm run typecheck` — sin errores.
- [x] `npm run lint` — sin warnings.
- [x] `npm test` — 85 archivos / 580 tests.
- [x] `npm run coverage` — 93,26 % statements, 87,57 % branches, 92,16 % functions, 95,27 % lines.
- [x] `npm run build` — chunk público 291 kB / 92 kB gzip (antes 525 kB / 152 kB).
- [ ] Revisión visual en dispositivo real (menú móvil, tooltips, FAQ, slider del estimador).
- [ ] Lighthouse móvil post-deploy.

## Métricas

| Métrica | Antes | Después |
| --- | --- | --- |
| JS inicial (gzip) | 151,73 kB | 92,02 kB |
| JS inicial (raw) | 524,73 kB | 291,03 kB |
| Captura de caso más pesada | 956,6 kB | 51,1 kB (23,4 kB en la variante usada) |
| Imágenes de casos en total | ≈ 2,53 MB | ≈ 158 kB generados / ~56 kB en carga típica |
| CSS | 42,55 kB | 47,67 kB (incluye dos `@font-face`) |
| Assets sin referencias en `public/` | 1,39 MB | 0 |

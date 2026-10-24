# Spec — Craft de interfaz y peso de la página

**Track:** `design_craft_perf_20261024`
**Fecha:** 2026-10-24
**Estado:** implementado (pendiente validación visual en dispositivo real)
**Origen:** auditoría del sitio público + panel con la skill `emil-design-eng`.

---

## Problema

El sitio se ve bien y el copy está resuelto, pero tres capas quedaban sin trabajar:

1. **Peso real de la página.** Una sola captura de caso pesaba 956 kB para renderizarse en un marco de 190 px de ancho, había 1,39 MB de PNGs que no referenciaba nadie, y el cliente de Supabase viajaba en el bundle inicial que descarga un visitante anónimo.
2. **Craft de motion.** `transition-all` en seis componentes, `Reveal` a 500 ms (fuera del presupuesto de UI), sin stagger, sin feedback de press en los botones, menú móvil y respuestas del FAQ apareciendo de golpe, tooltips sin origen, barra de progreso animando `width`.
3. **Accesibilidad de estados.** No existía ningún `prefers-reduced-motion`, los links a secciones aterrizaban debajo del navbar sticky, el texto más chico del footer no llegaba a AA y el estimador re-anunciaba el precio en cada píxel del slider.

## Objetivos

- Bajar el JS inicial por debajo de ~100 kB gzip y el peso de imágenes de casos a menos de 100 kB en la carga típica.
- Que todas las transiciones de UI duren menos de 300 ms, animen solo `transform`/`opacity` y usen curvas propias.
- Que cada elemento presionable dé feedback inmediato.
- Que el sitio respete `prefers-reduced-motion` de forma global y no rompa navegación por teclado.
- Un solo lugar por estilo: botones y campos de formulario dejan de estar recopiados en las páginas del panel.

## No objetivos

- No se toca el copy ni el posicionamiento (queda en `src/data/copy.ts`).
- No se agrega Framer Motion ni ninguna librería de animación: todo se resuelve con CSS transitions, `@starting-style` y el acordeón nativo.
- No se rediseña el sistema visual (tokens, tipografías, radios): se respeta `portfolio-design`.
- No se migra el contrato de datos ni las Edge Functions.

## Decisiones

| Decisión | Motivo |
| --- | --- |
| Tokens de easing propios en `@theme` (`--ease-out`, `--ease-in-out`, `--ease-drawer`) | Las curvas nativas son demasiado planas: una animación corta se lee como lenta |
| `@custom-variant hover-fine` en vez de repetir la media query | Un solo lugar para "hover real" y evita estados pegados en touch |
| `AuthProvider` sale del árbol público a `PrivateRoutes.tsx` lazy | Supabase deja de ser parte de la primera carga |
| `Reveal` con chequeo sincrónico de viewport + `@starting-style` | Evita el flash de contenido invisible cuando el elemento ya está en pantalla |
| Imágenes recomprimidas con `sharp` en un script versionado | Reproducible; los originales quedan en `assets/images-src/`, fuera del deploy |
| Fuentes self-hosted (subset latin, variables) | Saca dos orígenes de terceros del camino crítico del LCP |

## Criterios de aceptación

- [x] `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` verdes.
- [x] Cobertura por encima del umbral (80 %) en las cuatro métricas.
- [x] Cero `transition-all` en componentes de interfaz.
- [x] Cero animaciones de más de 300 ms en elementos de UI (la barra de progreso del panel es 400 ms, informativa y no interactiva).
- [x] Todo `hover:` aplicado a movimiento está detrás de `hover-fine:` y con escape `motion-reduce`.
- [x] Bloque global de `prefers-reduced-motion`.
- [x] Ningún asset servido supera los 60 kB salvo el JS del vendor.

## Riesgos

- `details::details-content` y `interpolate-size` son progresivos: donde no hay soporte el FAQ aparece instantáneo, sin romperse.
- El DOM del acordeón del panel y del menú móvil ahora está siempre montado (se oculta con `inert` + `aria-hidden`): verificado que ninguna consulta de tests por rol los alcanza.

# Spec — Baseline de formato y dos correcciones de configuración

- **Track**: `format_baseline_20261024`
- **Estado**: completado
- **Fecha**: 2026-10-24

## Contexto

`npm run format:check` fallaba en **390 archivos**, incluidos archivos que nunca se tocaron en este repositorio (`vercel.json`, `src/sections/Hero.tsx`, `supabase/functions/**`). Eso deja el script inservible como señal: no distingue "el repo está sucio" de "este cambio rompió el formato".

Al investigar la causa aparecieron dos problemas reales detrás del ruido:

1. **CSP rompía las fuentes propias.** `vercel.json` declaraba `font-src https://fonts.gstatic.com` sin `'self'`. Desde el track `design_craft_perf_20261024` las fuentes se sirven desde `/fonts/*.woff2`, así que en producción el navegador habría **bloqueado** ambas tipografías y caído al fallback del sistema. Los tests no lo detectan porque validan el HTML y el CSS, no una respuesta HTTP con CSP aplicada.
2. **JSON inválido.** `conductor/tracks/sec_approval_rls_20261012/metadata.json` tenía una llave de cierre extra; cualquier herramienta que lo parseara fallaba.

Además no existía `.prettierignore`, por lo que Prettier recorría `.agents/`, `.opencode/`, `conductor/` y `public/`: documentación, skills de terceros y binarios.

## Objetivo

Dejar `npm run format:check` en verde como red de seguridad real, sin tocar comportamiento, y corregir los dos defectos de configuración encontrados en el camino.

## No objetivos

- Cambiar reglas de Prettier (`.prettierrc` se mantiene tal cual).
- Formatear `.agents/`, `.opencode/`, `conductor/` o `public/` (se excluyen explícitamente).
- Cambiar copy, diseño o lógica.

## Decisiones

| Decisión | Alternativa descartada | Motivo |
| --- | --- | --- |
| Un commit `chore(format)` con todo el reformateo | Commits por carpeta | El diff es simétrico (521 inserciones / 521 borrados) y revisarlo por partes no aporta nada |
| CSP propia: `font-src 'self'` y quitar los dominios de Google de `style-src` | Dejar la CSP como estaba | Con la CSP anterior las fuentes self-hosted quedaban bloqueadas en producción |
| Ignorar `conductor/` y `.agents/` | Formatearlos también | Sumarían cientos de líneas de ruido a un diff que debe ser trivial de auditar |
| Corregir el `metadata.json` inválido en este track | Track aparte | Es un archivo de una línea; el costo de separarlo supera el beneficio |
| Verificar el reformateo con `git diff --stat` simétrico + suite completa | Confiar en Prettier | Un diff con inserciones ≠ borrados indicaría un cambio semántico |

## Criterios de aceptación

- [x] `npm run format:check` pasa sin warnings.
- [x] `git diff --stat` muestra inserciones y borrados iguales (521/521): reformateo puro.
- [x] `npm run typecheck`, `npm run lint`, `npm test` (85 archivos / 580 tests) y `npm run build` en verde.
- [x] El hash del bundle principal no cambia (`index-DF8Azt1H.js`, 92,02 kB gzip): el formato no altera la salida.
- [x] `vercel.json` permite `font-src 'self'`.
- [x] `metadata.json` de `sec_approval_rls_20261012` es JSON válido.

## Riesgos

- **Ruido en el historial.** Un commit de 100 archivos complica `git blame`. Mitigación: se aísla en su propio commit y se documenta acá; usar `git blame --ignore-rev` si molesta.
- **Divergencia futura.** Si alguien formatea `conductor/` a mano, `format:check` no lo detectará. Es un trade-off aceptado y explícito en `.prettierignore`.

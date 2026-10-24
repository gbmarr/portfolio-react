# Plan — Baseline de formato y correcciones de configuración

- **Track**: `format_baseline_20261024`
- **Spec**: [./spec.md](./spec.md)

## Fase 1 — Diagnóstico

- [x] Correr `npm run format:check` y contar archivos afectados (390).
- [x] Verificar que no existía `.prettierignore`.
- [x] Aislar el archivo que producía `Error occurred when checking code style` (`conductor/tracks/sec_approval_rls_20261012/metadata.json`, llave extra en la línea 21).
- [x] Revisar la CSP de `vercel.json` y detectar `font-src` sin `'self'`.

## Fase 2 — Correcciones

- [x] `vercel.json`: `font-src 'self'` y quitar `https://fonts.googleapis.com` de `style-src`.
- [x] `conductor/tracks/sec_approval_rls_20261012/metadata.json`: eliminar la llave sobrante.
- [x] Crear `.prettierignore` con `node_modules`, `dist`, `coverage`, `.vercel`, `.playwright`, `assets/`, `public/`, `.agents/`, `.opencode/`, `conductor/`.

## Fase 3 — Reformateo

- [x] `npm run format` sobre el árbol ya filtrado (102 archivos cambiados).
- [x] Confirmar diff simétrico: 521 inserciones / 521 borrados.

## Fase 4 — Verificación

- [x] `npm run format:check` → sin warnings.
- [x] `npm run typecheck` → PASS.
- [x] `npm run lint` → PASS.
- [x] `npm test` → 85 archivos / 580 tests verdes.
- [x] `npm run build` → mismo hash de bundle (`index-DF8Azt1H.js` 291,03 kB / 92,02 kB gzip).

## Resultado

| Métrica | Antes | Después |
| --- | --- | --- |
| Archivos con formato inválido | 390 | 0 |
| Fuentes propias permitidas por CSP | no (`font-src` solo gstatic) | sí (`font-src 'self'`) |
| `metadata.json` parseable | no | sí |
| Archivos recorridos por Prettier | todo el repo, incluidas skills de terceros | solo código y configuración del proyecto |

## Seguimiento sugerido

- Agregar `format:check` al pipeline de CI para que el baseline no se degrade.

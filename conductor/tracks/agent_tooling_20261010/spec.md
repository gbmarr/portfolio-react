# Spec — Tooling de agente: Context7, Playwright CLI y SkillUI (--dir)

> **Track ID:** `agent_tooling_20261010`
> **Fuente:** análisis solicitado por el usuario sobre 4 alternativas de plugins (Playwright CLI, Strix, SkillUi, Context7); decisión de implementar 3 de 4 en modo `--dir` para SkillUI.
> **Estado:** ✅ **Aprobado y ejecutado** (2026-10-11). Pendiente manual del usuario: reinicio de opencode + auth Context7 (T0.4) y checkpoint de confirmación (V.4).

---

## 1. Contexto y objetivo

El proyecto tiene un stack bleeding-edge (React 19, Vite 8, Tailwind 4 CSS-first, Vitest 5, TypeScript 6) y tres carencias de tooling para el agente:

1. **Documentación viva:** las APIs del stack cambian rápido; sin acceso a docs actualizadas hay riesgo de alucinación (Context7 lo mitiga con un MCP de documentación).
2. **Navegador real:** la suite es 100% jsdom; no existe forma de verificar comportamiento real del browser desde el agente (Playwright CLI lo habilita vía CLI + skill, token-eficiente).
3. **Design system consumible:** los tokens viven en `src/index.css` (`@theme`, Tailwind v4) y en componentes; no hay una skill estructurada que obligue a los agentes a respetar colores/tipografía/componentes (SkillUI en `--dir` la genera del propio repo).

**Objetivo:** incorporar estas tres capacidades **sin tocar el runtime de la app ni el fair-use** (nada server-side, nada de billing, nada que rompa build/tests).

Strix (pentesting autónomo) queda **fuera**: deprioritizado en el análisis (requiere Docker + LLM propio; el proyecto ya está endurecido).

---

## 2. Decisiones de arquitectura (propuestas)

- **D1 — Context7 como plugin (no MCP manual):** añadir `@upstash/context7-opencode` al array `plugin` de `opencode.json` (opencode v1 usa `plugin`, no `plugins`). Una línea, trae el MCP (`context7_resolve-library-id`, `context7_query-docs`) + la skill `context7-mcp`.
- **D2 — Playwright CLI como devDependency del repo** (reproducible y versionado; invocable con `npx playwright-cli`). ⚠️ *Alternativa: instalación global.* → **a confirmar por el usuario.**
- **D3 — SkillUI solo en modo `--dir .`** sobre el repo propio. Nunca `--url` sobre sitios de terceros (coherencia con `conductor/fair-use.md` y ética de diseño).
- **D4 — La skill de design system generada se versiona y se registra** para opencode (`.opencode/skills/` auto-descubierto o `skills.paths`). ⚠️ *Ubicación exacta y qué artefactos pesados (screenshots/zip) se commitean → a confirmar.*
- **D5 — Cero cambios en código de la app:** este track es de integración de tooling; typecheck/lint/test deben quedar exactamente verdes como están.

---

## 3. Functional Requirements

- **FR1 — Context7:** `opencode.json` incluye `@upstash/context7-opencode` en `plugin`, el archivo sigue siendo válido contra https://opencode.ai/config.json y opencode arranca; tras reiniciar y autenticar (OAuth `opencode mcp auth context7` o `CONTEXT7_API_KEY`), el agente puede resolver library-id y consultar docs de las librerías del stack.
- **FR2 — Playwright CLI:** `@playwright/cli` instalado (devDep), navegador Chromium instalado y la skill de Playwright disponible para el agente; un smoke real contra `npm run dev` funciona desde bash: `open http://localhost:5173` + `snapshot` + `screenshot`.
- **FR3 — SkillUI (--dir):** CLI `skillui` disponible; genera una skill de design system a partir de `--dir .`; sus tokens son coherentes con el `@theme` de `src/index.css` (colores, `--font-sans`/`--font-display`, shadows); la skill queda registrada y visible para opencode.
- **FR4 — Documentación:** `conductor/tech-stack.md` (§ Tooling) documenta las tres herramientas: instalación, verificación y uso; `opencode.json` queda explicado (plugin/skills.paths).
- **FR5 — Registro y commits:** track registrado en `conductor/tracks.md`; `metadata.json` al día; commits convencionales (`feat(agent):`, `chore(agent):`, etc.) con base siempre verde.

## 4. Non-Functional Requirements

- **NFR1 —** `opencode.json` válido; si se rompe el arranque, escape hatch documentado (`OPENCODE_DISABLE_PROJECT_CONFIG=1`).
- **NFR2 —** Reversibilidad: cada herramienta se remueve limpio (quitar línea / desinstalar / borrar carpeta) sin residuos en el runtime.
- **NFR3 —** `npm run typecheck`, `npm run lint` y `npm run test` siguen verdes (sin cambios de app).
- **NFR4 —** Fair-use intacto: nada server-side, sin billing, sin datos de terceros.
- **NFR5 —** Compatible Windows/PowerShell (workarounds documentados si hay fricción de antivirus/Chrome con Chromium).

## 5. Acceptance Criteria

- [x] `opencode.json` válido; Context7 registrado en `plugin`; reinicio + auth documentados (acción manual T0.4 pendiente de ejecución por el usuario).
- [x] `npx playwright-cli` ejecuta `install-browser` (chromium) y un smoke real: `open` → `snapshot` → `screenshot` contra `npm run dev`.
- [x] Skill de Playwright instalada/registrada (`.agents/skills/playwright-cli/`) y visible para el agente.
- [x] `skillui --dir .` produce una carpeta con `SKILL.md` y `DESIGN.md`; tokens curados y coherentes con `@theme` de `src/index.css` (el output crudo traía fuentes/colores espurios; corregido en T2.3).
- [x] Skill de design system registrada en `.opencode/skills/portfolio-design/` (auto-descubierta) y disponible para opencode.
- [x] `npm run typecheck`, `npm run lint`, `npm run test` verdes (sin cambios de código de la app): 416/416 tests, 0 errores lint, typecheck OK.
- [x] `conductor/tech-stack.md` § Tooling actualizado; `conductor/tracks.md` registrado; commits convencionales hechos.

## 6. Out of Scope

- Strix (pentesting autónomo) — deprioritizado.
- Migrar la suite Vitest/jsdom a `@playwright/test` (browser E2E como framework) o CI de navegador automático.
- Modo `--mode ultra` de SkillUI (depende de Playwright; solo si el usuario lo confirma).
- Clonar design systems de terceros con `--url`.
- Cambios de producto: UI, backend, migraciones o precio.

## 7. Notas / puntos a confirmar con el usuario

- **D2:** ¿Playwright CLI como **devDependency** (recomendado: reproducible) o **global** (`npm i -g`)? Ídem para `skillui`.
- **D4:** ¿dónde se versiona la skill generada — `.opencode/skills/<name>/` (auto-descubierta) o `conductor/design-system/` + `skills.paths`? ¿Se commitean screenshots/`.skill` zip o se gitignorean?
- **Acciones manuales requeridas:** reiniciar opencode (la config no hace hot-reload), autorizar el OAuth de Context7, aprobar la descarga de Chromium (~150 MB).
- **Windows:** si Playwright CLI choca con antivirus/Chrome, se documenta el workaround en tech-stack.

## 8. Commits del track

Ejecutado como 4 commits `chore(agent):` (2026-10-11):

- `chore(agent): añadir plugin Context7 (@upstash/context7-opencode) a opencode.json`
- `chore(agent): integrar Playwright CLI (devDep) + skill playwright-cli`
- `chore(agent): añadir skill de design system generada con SkillUI (--dir)`
- `chore(agent): documentar tooling y registrar track agent_tooling_20261010`
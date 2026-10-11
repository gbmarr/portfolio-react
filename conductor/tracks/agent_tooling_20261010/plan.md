# Plan: Tooling de agente — Context7, Playwright CLI y SkillUI (--dir)

> **Track ID:** `agent_tooling_20261010`
> **Spec:** [./spec.md](./spec.md)
> **Status:** ✅ **Implementado y verificado** (typecheck/lint/test verdes, 2026-10-11).
> Pendiente manual del usuario: **T0.4** (reiniciar opencode + auth Context7) y **V.4** (checkpoint de confirmación).
> **Reglas:** cambios reversibles; `opencode.json` siempre válido; sin tocar código de la app ni fair-use; verificación por fase con checkpoint del usuario (`workflow.md`); commits convencionales con base verde.

---

## Contexto

Tres capacidades de agente para el stack bleeding-edge del proyecto (React 19 / Vite 8 / Tailwind 4 CSS-first / Vitest 5 / TS 6):

1. **Context7** → MCP de documentación viva en `opencode.json` (plugin v1).
2. **Playwright CLI** → navegador real (Chromium) desde bash + skill para el agente.
3. **SkillUI `--dir .`** → skill de design system generada del repo propio.

Ninguna toca el runtime de la app: `typecheck`/`lint`/`test` quedaron exactamente verdes como estaban.

---

## Fase T0 — Context7 (MCP de documentación)

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T0.1 | Leer y respaldar `opencode.json` actual (conductor plugin + permisos) | `opencode.json` | ✅ |
| T0.2 | Añadir `"@upstash/context7-opencode"` al array `plugin` | `opencode.json` | ✅ |
| T0.3 | Validar JSON contra https://opencode.ai/config.json y que opencode arranque | — | ✅ |
| T0.4 | **[Usuario]** Reiniciar opencode + autenticar: `opencode mcp auth context7` (OAuth) o `CONTEXT7_API_KEY` | — | ⬜ |
| T0.5 | Verificación: consulta real de docs de una lib del stack (p. ej. React 19 / Tailwind 4) vía `context7-*` | — | ⬜ |

> *Fallback si el plugin diera problemas:* MCP manual `{ "mcp": { "context7": { "type": "remote", "url": "https://mcp.context7.com/mcp/oauth" } } }` + `opencode mcp auth context7`.

## Fase T1 — Playwright CLI (browser real + skill)

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T1.1 | Instalar `@playwright/cli` como devDependency (**o global** según decisión D2) | `package.json` | ✅ |
| T1.2 | (Opcional) Script npm de conveniencia `agent:playwright` | `package.json` | ⬜ (opcional, no aplicado) |
| T1.3 | `npx playwright-cli install-browser` (Chromium, ~150 MB) | — | ✅ |
| T1.4 | Instalar/registrar la skill de Playwright (`install --skills`; destino `.opencode/skills/` o `~/.agents/skills/`); añadir `skills.paths` en `opencode.json` si aplica | carpeta de skill | ✅ (`.agents/skills/playwright-cli/`; auto-descubierta, sin `skills.paths`) |
| T1.5 | Smoke real: `npm run dev` + `playwright-cli open http://localhost:5173` + `snapshot` + `screenshot` | — | ✅ |
| T1.6 | Documentar instalación + workaround Windows (antivirus/Chrome) | `conductor/tech-stack.md` (§ Tooling) | ✅ |

## Fase T2 — SkillUI --dir (design system → skill)

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T2.1 | Instalar `skillui` (global con `npm i -g skillui` o `npx skillui`) | — | ✅ (`npm i -g skillui` → 1.3.4) |
| T2.2 | Ejecutar `skillui --dir . --name <name> --out <destino>` en modo default (nunca `--url`) | salida del CLI | ✅ (`--name portfolio-design --out .opencode/skills`) |
| T2.3 | Auditar tokens generados vs `@theme` de `src/index.css` y datos reales; ajustar si Tailwind v4 no se parsea bien | `src/index.css`, salida | ✅ (curado: fuentes/paleta reales; inventario de componentes §4 correcto) |
| T2.4 | Registrar la skill (decisión D4: `.opencode/skills/` vs `conductor/design-system/` + `skills.paths`); decidir gitignore de screenshots/`.skill` | `.gitignore` | ✅ (`.opencode/skills/portfolio-design/`; `*.skill` y `screens/` gitignored) |
| T2.5 | Documentar generación + regeneración futura | `conductor/tech-stack.md` (§ Tooling) | ✅ |

## Fase T3 — Registro y cierre

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T3.1 | Registrar track en el registro | `conductor/tracks.md` | ✅ |
| T3.2 | Actualizar `metadata.json` (status → completed, updated_at) | `conductor/tracks/agent_tooling_20261010/metadata.json` | ✅ |
| T3.3 | Commit(s) convencionales por fase o al final | git | ✅ (4 commits `chore(agent):`, 2026-10-11) |

## Fase V — Verificación final

| # | Tarea | Herramienta | Estado |
|---|-------|-------------|--------|
| V.1 | `npm run typecheck` | — | ✅ (intacto) |
| V.2 | `npm run lint` | — | ✅ (0 errores; 2 warnings preexistentes en `auth.tsx`/`ClientProjectsPage.tsx`, ajenos al track) |
| V.3 | `npm run test` | Vitest | ✅ (67 files / 416 tests pasan) |
| V.4 | [Checkpoint] El usuario confirma manualmente las 3 herramientas (Context7 consulta docs; Playwright smoke; SkillUI tokens/skill) | — | ⬜ |
| V.5 | `opencode.json` válido; opencode arranca tras reinicio | — | ⬜ (con T0.4) |

---

## Riesgos

| Riesgo | Mitigación |
|--------|-----------|
| `opencode.json` inválido → opencode no arranca | Validado contra schema antes; escape hatch `OPENCODE_DISABLE_PROJECT_CONFIG=1`; backup previo |
| Descarga Chromium bloqueada por antivirus/Chrome en Windows | Documentado en tech-stack; el CLI autodetecta msedge/chrome instalado |
| SkillUI no parsea `@theme` de Tailwind v4 (no hay tailwind.config) | Auditoría T2.3: la salida se curó manualmente con tokens reales (fuentes/paleta) |
| Context7 requiere OAuth/API key | `CONTEXT7_API_KEY` como fallback / MCP manual (documentado en plan y tech-stack) |
| Instalación global contamina el entorno | Playwright CLI es devDep (reproducible); skillui global documentado con nota de regeneración |
| Config no se recarga en caliente | Reinicio de opencode documentado como paso manual (T0.4) |
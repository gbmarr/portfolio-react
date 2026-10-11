# Project Tracks

This file tracks all major tracks for the project. Each track has its own detailed plan in its respective folder.

---

- [x] **Track: Build the initial portfolio website**
      _Link: [./tracks/portfolio_20260801/](./tracks/portfolio_20260801/)_
- [x] **Track: Refactor portfolio into web services site**
      _Link: [./tracks/portfolio_20260915/](./tracks/portfolio_20260915/)_ — implementación completa; pendiente configuración del usuario (key Web3Forms, número WhatsApp, precios, dominio)
- [x] **Track: Fair-use Hobby + acceso clientes + estimador de presupuesto**
      _Link: [./tracks/fairuse_20261008/](./tracks/fairuse_20261008/)_ — implementado y verificado (2026-10-08); pendiente del usuario: valor `arsRate` real y re-asociar dominio en Vercel
- [x] **Track: Brief de proyecto en el panel del cliente**
      _Link: [./tracks/client_brief_20261008/](./tracks/client_brief_20261008/)_ — implementado y verificado (2026-10-08); pendiente/follow-up: subida de archivos (Supabase Storage) y email automático (requeriría Pro)
- [x] **Track: Mejoras de panel — brief ágil, plantilla de etapas y cierre de proyecto**
      _Link: [./tracks/panel_ux_20261008/](./tracks/panel_ux_20261008/)_ — implementado y verificado (2026-10-08); incluye migración `0004` (completed_at)
- [x] **Track: Hardening de seguridad (auditoría run-1)**
      _Link: [./tracks/security_hardening_20261009/](./tracks/security_hardening_20261009/)_ — implementado y verificado (2026-10-09). Remedia los 8 leads `needs_validation` de la auditoría `portfolio-run-1` (remediados 0005/código, mitigado deploy, aceptados Web3Forms/passkey). Migraciones `0005` y `0006` aplicadas. Pendiente/aceptado: alinear RP ID de passkeys al dominio propio y antispam server-side (fuera del fair-use)
- [x] **Track: Email propio + Turnstile (reemplazo de Web3Forms)**
      _Link: [./tracks/own_email_notifications_20261009/](./tracks/own_email_notifications_20261009/)_ — implementado y verificado en producción (2026-10-10). Edge Function `contact-notify` (Deno) + Cloudflare Turnstile + Resend API desde `hola@gabrielmarrero.com.ar` (dominio verificado; Zoho Mail sigue como receptor); rate-limit DB endurecido a 1/min (`0008`); Web3Forms retirado. Cierra leads #4 y #7 de la auditoría `portfolio-run-1`
- [x] **Track: Coherencia de checks del estimador — matriz de compatibilidad tier↔extra**
      _Link: [./tracks/estimator_tier_extras_20261010/](./tracks/estimator_tier_extras_20261010/)_ — implementado y verificado (2026-10-10). Matriz fuente única en `src/data/estimate.ts` (`tiers`/`includedFor`): landing sin blog/tienda, institucional sin tienda (elimina el arbitraje vs. `medida`), `medida` con tienda incluida sin cobro; poda al cambiar de tier en público y admin; brief `medida` sin e-commerce forzado (catálogo/cobro dependen del extra `ecommerce`); copy "3 secciones base" reconciliado
- [x] **Track: Tooling de agente — Context7, Playwright CLI y SkillUI (--dir)**
      _Link: [./tracks/agent_tooling_20261010/](./tracks/agent_tooling_20261010/)_ — implementado y verificado (2026-10-11). Context7 registrado como plugin (`@upstash/context7-opencode`); Playwright CLI devDep + Chromium + skill en `.agents/skills/playwright-cli/` (smoke OK en localhost:5173); skill de design system curada en `.opencode/skills/portfolio-design/` (SkillUI `--dir`, tokens coherentes con `@theme`); tech-stack.md § Tooling documentado; typecheck/lint/test verdes. Pendiente manual del usuario: reiniciar opencode + auth Context7 (T0.4/V.4)

---

## Backlog — Tracks preparados (2026-10-11)

Tracks creados con spec + plan a partir del **reporte de aptitud MVP/v1** (análisis 2026-10-11). Estado: `pending` (sin implementar). Cada uno tiene su issue en GitHub (`gbmarr/portfolio-react`).

- [ ] **Track: Documentar README del proyecto**
      _Link: [./tracks/readme_docs_20261011/](./tracks/readme_docs_20261011/)_ — Gap 1 del reporte MVP: reemplazar el README default de Vite por docs reales (producto, stack, setup, scripts, superficies, deploy). Docs-only.
- [ ] **Track: Code-splitting de paneles admin/cliente**
      _Link: [./tracks/code_splitting_20261011/](./tracks/code_splitting_20261011/)_ — Gap 2 (bundle 574 kB > 500 kB): React.lazy + Suspense para `/admin/*` y `/panel/*` en `AppRouter.tsx`. Decisión: lazy de paneles (confirmada con el usuario).
- [ ] **Track: Cotización arsRate configurable del estimador**
      _Link: [./tracks/ars_rate_config_20261011/](./tracks/ars_rate_config_20261011/)_ — Gap 3: env var pública `ARS_RATE` con prefijo `ARS_` en `vite.config.ts`, fallback 1400, helper `resolveArsRate` testeado. Decisión: env var con fallback (confirmada con el usuario).
- [ ] **Track: Sincronizar documentación de producto**
      _Link: [./tracks/docs_sync_20261011/](./tracks/docs_sync_20261011/)_ — Gap 4: retirar el requisito bilingüe ES/EN de `product-guidelines.md` (el sitio es solo español) y corregir `product.md` (dominio `gabrielmarrero.com.ar`, estado 2026-10-11, Lighthouse fechado).
- [ ] **Track: Eliminar warnings de react-refresh/only-export-components**
      _Link: [./tracks/lint_cleanup_20261011/](./tracks/lint_cleanup_20261011/)_ — Gap 5: separar exports no-componentes de `src/lib/auth.tsx` y `src/pages/client/ClientProjectsPage.tsx`; lint target 0 warnings sin `eslint-disable`.
- [ ] **Track: Endurecer tests — cobertura Turnstile y velocidad de la suite**
      _Link: [./tracks/test_hardening_20261011/](./tracks/test_hardening_20261011/)_ — Gap 6: subir branches de `Turnstile.tsx` de ~50% a ≥80% (tests de callbacks/ausencia de widget) + acelerar suite (~98s) con pool `vmThreads` de Vitest 5. Decisiones confirmadas con el usuario.



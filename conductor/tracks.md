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

Tracks creados con spec + plan a partir del **reporte de aptitud MVP/v1** (análisis 2026-10-11). Estado: `pending` (sin implementar) salvo los marcados. Cada uno tiene su issue en GitHub (`gbmarr/portfolio-react`).

- [x] **Track: Documentar README del proyecto**
      _Link: [./tracks/readme_docs_20261011/](./tracks/readme_docs_20261011/)_ — Gap 1 del reporte MVP: reemplazar el README default de Vite por docs reales (producto, stack, setup, scripts, superficies, deploy). Docs-only. **Implementado 2026-10-11** (issue #1).
- [x] **Track: Code-splitting de paneles admin/cliente**
      _Link: [./tracks/code_splitting_20261011/](./tracks/code_splitting_20261011/)_ — Gap 2 (bundle 574 kB > 500 kB): React.lazy + Suspense para `/admin/*` y `/panel/*` en `AppRouter.tsx`. Decisión: lazy de paneles (confirmada con el usuario). **Implementado 2026-10-11** (issue #2): 8 chunks lazy, bundle público 574.28 → 518.08 kB, 437 tests, coverage ≥80%. Follow-up: vendor splitting (chunk principal sigue >500 kB).
- [x] **Track: Cotización arsRate configurable del estimador**
      _Link: [./tracks/ars_rate_config_20261011/](./tracks/ars_rate_config_20261011/)_ — Gap 3: env var pública `ARS_RATE` con prefijo `ARS_` en `vite.config.ts`, fallback 1400, helper `resolveArsRate` testeado. Decisión: env var con fallback (confirmada con el usuario). **Implementado 2026-10-11** (issue #3).
- [x] **Track: Sincronizar documentación de producto**
      _Link: [./tracks/docs_sync_20261011/](./tracks/docs_sync_20261011/)_ — Gap 4: retirar el requisito bilingüe ES/EN de `product-guidelines.md` (el sitio es solo español) y corregir `product.md` (dominio `gabrielmarrero.com.ar`, estado 2026-10-11, Lighthouse fechado). **Implementado 2026-10-11** (issue #4).
- [x] **Track: Eliminar warnings de react-refresh/only-export-components**
      _Link: [./tracks/lint_cleanup_20261011/](./tracks/lint_cleanup_20261011/)_ — Gap 5: separar exports no-componentes de `src/lib/auth.tsx` (→ `auth-context.ts`) y `src/pages/client/ClientProjectsPage.tsx` (`computeProgress` → `src/lib/projects.ts`); lint 0 warnings sin `eslint-disable`. **Implementado 2026-10-11** (issue #5).
- [x] **Track: Endurecer tests — cobertura Turnstile y velocidad de la suite**
      _Link: [./tracks/test_hardening_20261011/](./tracks/test_hardening_20261011/)_ — Gap 6: subir branches de `Turnstile.tsx` de ~50% a ≥80% (tests de callbacks/ausencia de widget) + acelerar suite (~98s) con pool `vmThreads` de Vitest 5. Decisiones confirmadas con el usuario. **Implementado 2026-10-11** (issue #6): Turnstile 100% branches, suite 73.39s → 15.61s.

---

## Backlog de seguridad — Auditoría run-2 (2026-10-11)

Tracks creados con spec + plan a partir de la **auditoría de seguridad run-2** (`.scratch/security-audit/run-2/REPORT.md`). Referencia **ASVS L2–L3**. Estado: `pending` (sin implementar). Cada uno tiene su issue en GitHub (`gbmarr/portfolio-react`, etiqueta `security`). Orden sugerido de ejecución: T1 → T2 → T5 → T3 → T4 → T6 → T7 → T8 → T9.

- [~] **Track: Cerrar INSERT anónimo en `contact_messages` (SEC-001, Media)**
      _Link: [./tracks/sec_contact_anon_insert_20261011/](./tracks/sec_contact_anon_insert_20261011/)_ — la policy `with check (true)` a `anon` permite insertar directo por PostgREST esquivando Turnstile. (issue #7) — **código implementado 2026-10-11** (migración `0009` + retiro de `saveContactMessage`); pendiente aplicar `0009` en Supabase y verificar el bloqueo de anon.
- [~] **Track: MFA / step-up para el acceso admin (SEC-002, Media)**
      _Link: [./tracks/sec_admin_mfa_20261011/](./tracks/sec_admin_mfa_20261011/)_ — exigir AAL2 en `/admin/*`, leaked-password protection y rate-limit de auth. (issue #8) — **código implementado 2026-10-11** (step-up AAL2 en `RequiereAdmin`, `AdminMfaPage`, tests 459 ✓); pendiente config dashboard del owner (`CHECKLIST-OWNER.md`).
- [~] **Track: Endurecer el rate-limit de contacto (SEC-003, Baja)**
      _Link: [./tracks/sec_contact_rate_limit_20261011/](./tracks/sec_contact_rate_limit_20261011/)_ — dependencia de `x-forwarded-for` falsificable y fail-open; verificar passthrough vía service_role. (issue #9) — **código implementado 2026-10-11** (migración `0010`: fail-closed sin IP + límite global 120/min; Edge Function `clientIp()` + `setHeader("x-client-ip")`; tests 463 ✓); pendiente aplicar `0010` en Supabase y desplegar `contact-notify` (`CHECKLIST-OWNER.md`).
- [ ] **Track: No exponer `detail` del proveedor de email (SEC-004, Baja)**
      _Link: [./tracks/sec_mail_detail_leak_20261011/](./tracks/sec_mail_detail_leak_20261011/)_ — devolver error genérico y loguear server-side. (issue #10)
- [~] **Track: Restringir el auto-registro por magic link (SEC-005, Baja)**
      _Link: [./tracks/sec_magiclink_signup_20261011/](./tracks/sec_magiclink_signup_20261011/)_ — `shouldCreateUser: false` sin romper invitaciones. (issue #11) — **código implementado 2026-10-11** (`signInWithMagicLink` sin auto-registro + `user_not_found` indistinguible; `inviteByMagicLink` crea cuenta para invitaciones; tests 463 ✓).
- [ ] **Track: Proteger `project_briefs.status` (SEC-006, Baja)**
      _Link: [./tracks/sec_brief_status_guard_20261011/](./tracks/sec_brief_status_guard_20261011/)_ — extender el guard o derivar `status` server-side. (issue #12)
- [ ] **Track: Línea base DevSecOps y cadena de suministro (SEC-007, Baja)**
      _Link: [./tracks/sec_devsecops_baseline_20261011/](./tracks/sec_devsecops_baseline_20261011/)_ — Dependabot, CI con `npm audit`, `security.txt`, (fase 2) SAST/SBOM. (issue #13)
- [ ] **Track: Endurecer el almacenamiento de sesión (SEC-008, Baja)**
      _Link: [./tracks/sec_session_hardening_20261011/](./tracks/sec_session_hardening_20261011/)_ — evaluar cookies httpOnly y acotar `connect-src`. (issue #14)
- [ ] **Track: Higiene de configuración de seguridad (SEC-009, Info)**
      _Link: [./tracks/sec_config_hygiene_20261011/](./tracks/sec_config_hygiene_20261011/)_ — HSTS declarado, docs, `envPrefix`, `connect-src`. (issue #15)



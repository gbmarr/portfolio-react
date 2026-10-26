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

Tracks creados con spec + plan a partir de la **auditoría de seguridad run-2** (`.scratch/security-audit/run-2/REPORT.md`). Referencia **ASVS L2–L3**. Estado: `completed` — ciclo completo cerrado el 2026-10-11 (código implementado, pasos de owner aplicados y verificación en producción). Cada uno tuvo su issue en GitHub (`gbmarr/portfolio-react`, etiqueta `security`) — issues #7–#15 cerrados.

- [x] **Track: Cerrar INSERT anónimo en `contact_messages` (SEC-001, Media)**
      _Link: [./tracks/sec_contact_anon_insert_20261011/](./tracks/sec_contact_anon_insert_20261011/)_ — migración `0009` (drop policy anon + revoke insert) aplicada en Supabase; `saveContactMessage` retirado; bloqueo de INSERT anónimo verificado. (issue #7, commit `08deb60`)
- [x] **Track: MFA / step-up para el acceso admin (SEC-002, Media)**
      _Link: [./tracks/sec_admin_mfa_20261011/](./tracks/sec_admin_mfa_20261011/)_ — AAL2 en `/admin/*` + `AdminMfaPage`; TOTP y Leaked Password Protection activados en dashboard; flujo verificado en prod (incluye hotfix `b6b742f` para el challenge desde el QR de enrolamiento). (issue #8, commits `1aa27a4` + `b6b742f`)
- [x] **Track: Endurecer el rate-limit de contacto (SEC-003, Baja)**
      _Link: [./tracks/sec_contact_rate_limit_20261011/](./tracks/sec_contact_rate_limit_20261011/)_ — migración `0010` (fail-closed sin IP + límite global 120/min) aplicada; Edge Function `contact-notify` desplegada con `clientIp()`/`x-client-ip`. (issue #9, commit `b2d2d8a`)
- [x] **Track: No exponer `detail` del proveedor de email (SEC-004, Baja)**
      _Link: [./tracks/sec_mail_detail_leak_20261011/](./tracks/sec_mail_detail_leak_20261011/)_ — `email-result.ts` puro (respuesta sin detail) + `logMailError` server-side; Edge Function desplegada. (issue #10, commit `048873c`)
- [x] **Track: Restringir el auto-registro por magic link (SEC-005, Baja)**
      _Link: [./tracks/sec_magiclink_signup_20261011/](./tracks/sec_magiclink_signup_20261011/)_ — `signInWithMagicLink` sin auto-registro + `user_not_found` indistinguible; `inviteByMagicLink` conserva las invitaciones del admin. (issue #11, commit `5b4bbdc`)
- [x] **Track: Proteger `project_briefs.status` (SEC-006, Baja)**
      _Link: [./tracks/sec_brief_status_guard_20261011/](./tracks/sec_brief_status_guard_20261011/)_ — migración `0011` (`compute_brief_status` SQL espejo + guard fuerza el valor derivado para no-admin) aplicada; el cliente deja de enviar `status`. (issue #12, commit `4c75c50`)
- [x] **Track: Línea base DevSecOps y cadena de suministro (SEC-007, Baja)**
      _Link: [./tracks/sec_devsecops_baseline_20261011/](./tracks/sec_devsecops_baseline_20261011/)_ — push a main realizado; CI (install/lint/typecheck/test/build + `npm audit --audit-level=high` + SBOM CycloneDX) verde; CodeQL + Dependabot activos; `/.well-known/security.txt` 200 con `Cache-Control: no-store`. (issue #13, commit `6ede026`)
- [x] **Track: Endurecer el almacenamiento de sesión (SEC-008, Baja)**
      _Link: [./tracks/sec_session_hardening_20261011/](./tracks/sec_session_hardening_20261011/)_ — ADR-0001 (cookie httpOnly inviable en SPA estática); PKCE + `connect-src` acotado al ref verificados en producción (CSP en curl HEAD). (issue #14, commit `17bf50a`)
- [x] **Track: Higiene de configuración de seguridad (SEC-009, Info)**
      _Link: [./tracks/sec_config_hygiene_20261011/](./tracks/sec_config_hygiene_20261011/)_ — HSTS declarado y verificado en prod (`max-age=63072000`); envs renombradas a `PUBLIC_*` en Vercel/Netlify + `.env.local`; docs Web3Forms retiradas. (issue #15, commit `420532c`)

---

## Follow-up UX — post auditoría run-2 (2026-10-12)

- [x] **Track: Reenvío de invitación en /admin/clientes**
      _Link: [./tracks/invite_ux_fix_20261012/](./tracks/invite_ux_fix_20261012/)_ — hallazgo del análisis read-only del flujo de invitación: el botón estaba oculto para clientes "Activos" (cuenta creada al invitar pero quizá nunca ingresaron). Ahora toda fila tiene acción (`Invitar` / `Reenviar enlace`), el estado efímero `Invitación enviada ✓` se conserva y `inviteByMagicLink` (OTP a cuentas existentes) mantiene el flujo. **Implementado 2026-10-12**: 70 archivos / 469 tests verdes.

---

## Seguridad — endurecimiento envío de email de contacto (2026-10-12)

- [x] **Track: Hardening envío de email del formulario de contacto (SEC-005/006/007)**
      _Link: [./tracks/sec_contact_email_hardening_20261011/](./tracks/sec_contact_email_hardening_20261011/)_ — solicitud del owner (restringir proveedores de email) → **ADR-0002**: allowlist rechazado (security theater). Implementado: `validation.ts` puro con validación server-side anti-CRLF (`name`/`email`), `reply_to` solo si email válido, `isTurnstileResponseValid` (action + hostname), blocklist de dominios desechables; migración `0012` con CHECK constraints `[[:cntrl:]]` en `name`/`email`; paridad cliente. **Completado 2026-10-12** (commit `62a9641`): migración `0012` aplicada en Supabase + Edge Function desplegada y verificada en producción (email normal llega, WhatsApp sin `reply_to`, desechable → 400, CRLF → 400).

---

## Red Team — evaluación adversarial autorizada (2026-10-12)

Tracks creados con spec + plan a partir del **paper red team** (`conductor/security/red-team-20261012/`: informe de cadena de ataque, hallazgos individuales y plan de pruebas). Alcance: repo local, solo lectura de código (sin pruebas activas). Estado: `pending` salvo el marcado; cada uno con su issue en GitHub (`gbmarr/portfolio-react`).

- [ ] **Track: MFA admin aplicada en RLS (RT-01, Alta)**
      _Link: [./tracks/sec_admin_mfa_rls_20261012/](./tracks/sec_admin_mfa_rls_20261012/)_ — la MFA de SEC-002 es solo client-side; `is_admin()` en RLS no mira el claim `aal`. Un token AAL1 (password grant) accede a todo el panel vía PostgREST. Choke point único: `is_admin_aal2()` + `is_admin()` delegado. **Código listo 2026-10-12** (72 archivos / 493 tests verdes); **migración `0013` aplicada en Supabase por el owner (2026-10-12)** — ver `CHECKLIST-OWNER.md` (issue #25).
- [ ] **Track: Audit log de acciones admin (RT-04, Media)**
      _Link: [./tracks/sec_admin_audit_log_20261012/](./tracks/sec_admin_audit_log_20261012/)_ — no hay `audit_log`; el abuso admin es indetectable. Tabla + triggers + consultas de detección. Depende de RT-01 para la detección efectiva (issue #26). **Código listo 2026-10-12** (73 archivos / 499 tests verdes; `auditLog.test.ts` 6 tests; typecheck/lint ok); **migración `0014` aplicada en Supabase por el owner (2026-10-12)** — ver `CHECKLIST-OWNER.md`.
- [ ] **Track: Cerrar self-signup por API + validar `client_email` (RT-02, Media)**
      _Link: [./tracks/sec_signup_lockdown_20261012/](./tracks/sec_signup_lockdown_20261012/)_ — `shouldCreateUser:false` es solo UI; `/auth/v1/otp` acepta `create_user=true`. `disable_signup` (owner) + validación/normalización de `client_email` (issue #27). **Código listo 2026-10-12** (76 archivos / 512 tests verdes; `src/utils/email.ts` + UI + lib; migración `0015` con CHECK estructural `NOT VALID`); pendiente owner: `disable_signup` + aplicar `0015` — ver `CHECKLIST-OWNER.md`.
- [ ] **Track: Ownership en UPDATE de `milestone_approvals` (RT-03, Baja)**
      _Link: [./tracks/sec_approval_rls_20261012/](./tracks/sec_approval_rls_20261012/)_ — el `with check` del UPDATE no re-valida la pertenencia del proyecto (a diferencia del INSERT). Impacto de integridad acotado (issue #28). **Código listo 2026-10-12** (77 archivos / 516 tests verdes; migración `0016` recrea la policy con ownership en `using`/`with check`); **pendiente owner: aplicar la migración `0016` en Supabase** — ver `CHECKLIST-OWNER.md`.

---

## Arquitectura — Revisión de profundidad de módulos (2026-10-12)

Tracks creados con spec + plan a partir de la **revisión de arquitectura del codebase** (skill `improve-codebase-architecture`, vocabulario `codebase-design`: módulo / interface / profundidad / seam / adapter / leverage / locality). Objetivo: convertir módulos **shallow** en **deep** para mejorar testabilidad y navegabilidad. Estado: `pending` (sin implementar). Cada uno con su issue en GitHub (`gbmarr/portfolio-react`, etiqueta `refactor` / `perf`).

- [x] **Track: Unificar los loaders async con `useAsyncData` + `Loading`/`ErrorAlert` (C1, Strong)**
      _Link: [./tracks/arch_async_data_hook_20261012/](./tracks/arch_async_data_hook_20261012/)_ — ocho páginas admin/cliente repiten a mano la misma máquina de estados de carga (unión `State` + `useEffect` con `cancelled` + `try/catch` + bloques JSX de loading/error duplicados; `panelCopy.error.generic` ~16×). Profundizar un módulo `useAsyncData(loader, deps)` con interfaz `{ data, error, loading, reload }` más `Loading`/`ErrorAlert` compartidos. **Recomendación #1 de la revisión** (issue #29).
- [x] **Track: Agregado `loadProjectDetail` en la capa de datos (C2, Strong)**
      _Link: [./tracks/arch_project_detail_aggregate_20261012/](./tracks/arch_project_detail_aggregate_20261012/)_ — el agregado "detalle de proyecto" se re-declara y ensambla en ambas páginas de detalle, y "no encontrado" ramifica por el string exacto `'Proyecto no encontrado'` (seam filtrado). Mover `loadProjectDetail(id)` + tipo `ProjectDetail` + error tipado a `src/lib/projects.ts` (issue #34).
- [x] **Track: Contrato único de contacto compartido cliente/Edge Function (C3, Worth exploring)**
      _Link: [./tracks/arch_contact_contract_20261012/](./tracks/arch_contact_contract_20261012/)_ — la política de contacto vive copiada a ambos lados del seam (`CONTACT_LIMITS` ×2, `hasControlChars` ×2, regex de email ×4 incl. migración `0015`, `TURNSTILE_ACTION` ×2); `ContactForm` re-valida con constantes `MAX_*` propias. Un módulo de contrato puro en `supabase/functions/_shared/` consumido por ambos adapters (issue #30).
- [x] **Track: Helper único `Result`/unwrap + eliminar superficie muerta (C4, Worth exploring)**
      _Link: [./tracks/arch_data_result_helper_20261012/](./tracks/arch_data_result_helper_20261012/)_ — `Result<T>`/desenvolvío implementado cuatro veces (briefs/projects + patrón inline en clients/messages), ~16 `throw new Error(error.message)`, `unwrapList` duplicado; `listClientProfiles` muerta. Módulo `src/lib/supabase-result.ts` (issue #31).
- [x] **Track: Batch de etapas en el listado del cliente — N+1 (C5, Worth exploring)**
      _Link: [./tracks/arch_client_projects_batch_20261012/](./tracks/arch_client_projects_batch_20261012/)_ — `ClientProjectsPage` consulta etapas por proyecto (`Promise.all(projects.map(listStages))`); la función pura `computeProgress` es correcta, el defecto está en cómo se llama. `listStagesForProjects(ids)` en una sola consulta (issue #32).
- [x] **Track: Estimador puro — `arsRate` inyectado y límites unificados (C6, Speculative)**
      _Link: [./tracks/arch_estimate_purity_20261012/](./tracks/arch_estimate_purity_20261012/)_ — `computeEstimate` impuro (lee `arsRate` a nivel de módulo desde `import.meta.env.PUBLIC_ARS_RATE`), `MIN/MAX_SECTIONS` duplicados lib/UI, `buildEstimateWhatsAppMessage` re-deriva las extras. Inyección de `arsRate` + un solo hogar para los límites (issue #33).

---

## Preview de proyecto y skills de motion (2026-10-24)

- [ ] **Track: Preview visual del avance del proyecto (capturas + enlace externo)**
      _Link: [./tracks/project_preview_20261024/](./tracks/project_preview_20261024/)_ — el admin publica capturas en el bucket privado `project-previews` (etapa, epígrafe, visibilidad) y un enlace externo HTTPS; el cliente ve una galería en `/panel/:id` con signed URLs y un botón “Abrir preview” en pestaña nueva. Sin iframe, sin serverless nuevo y sin montos. **Código + tests completos 2026-10-24** (85 archivos / 580 tests; coverage 93.56% statements; typecheck/lint/build verdes). **Pendiente owner:** aplicar `0017_project_previews.sql` en Supabase y hacer smoke manual con una imagen real.
- [x] **Track: Skills de Emil Kowalski (subset curado)**
      _Link: [./tracks/emil_skills_20261024/](./tracks/emil_skills_20261024/)_ — se evaluaron `emilkowalski/skills` e `pbakaus/impeccable`. Se instalaron 8 skills de Emil en `.agents/skills/` (`emil-design-eng`, `animate`, `review-animations`, `improve-animations`, `animation-performance`, `animation-vocabulary`, `mobile-native`, `break-ui`) y se registraron en `skills-lock.json`; Impeccable se descartó por conflicto con el design system y telemetría/hooks. `portfolio-design` conserva precedencia sobre tokens/colores/tipografía. **Completado 2026-10-24** (suite completa verde).

---

## Craft de interfaz y peso de la página (2026-10-24)

- [x] **Track: Craft de interfaz y peso de la página**
      _Link: [./tracks/design_craft_perf_20261024/](./tracks/design_craft_perf_20261024/)_ — auditoría con la skill `emil-design-eng` y ejecución del plan en tres frentes: (1) **peso** — `AuthProvider` y las rutas privadas salen a un chunk lazy (`PrivateRoutes.tsx`), capturas recomprimidas a WebP con `scripts/optimize-images.mjs` (956 kB → 23 kB), 1,39 MB de PNGs sin referencias fuera de `public/`, fuentes self-hosted y OG image corregida; (2) **craft** — tokens de easing propios, `hover-fine`, `Reveal` 260 ms con stagger 60 ms, `active:scale-[0.97]` en botones, menú móvil y FAQ animados, tooltips con `transform-origin` y modo instantáneo, barra de progreso con `scaleX`; (3) **accesibilidad** — `prefers-reduced-motion` global, `scroll-padding-top` para el navbar sticky, contraste del footer, `aria-live` del estimador con debounce. **Completado 2026-10-24**: 85 archivos / 580 tests, coverage 93,26 % statements, JS inicial 152 kB → 92 kB gzip. Pendiente: smoke visual en dispositivo real y Lighthouse post-deploy.

---

## Baseline de formato (2026-10-24)

- [x] **Track: Baseline de formato y correcciones de configuración**
      _Link: [./tracks/format_baseline_20261024/](./tracks/format_baseline_20261024/)_ — `format:check` fallaba en 390 archivos y arrastraba dos defectos reales: la CSP de `vercel.json` tenía `font-src https://fonts.gstatic.com` sin `'self'` (habría bloqueado las fuentes self-hosted en producción) y el `metadata.json` de `sec_approval_rls_20261012` era JSON inválido. Se agregó `.prettierignore` (excluye `.agents/`, `.opencode/`, `conductor/`, `public/`, `assets/`), se reformateó el árbol (102 archivos, diff simétrico 521/521) y se verificó que el bundle no cambia de hash. **Completado 2026-10-24**: 580 tests verdes, coverage 93,26 % statements.

---

## Captación de leads — Solicitud de presupuesto (2026-10-24)

- [x] **Track: Solicitud de presupuesto sin precios públicos**
      _Link: [./tracks/quote_request_20261024/](./tracks/quote_request_20261024/)_ — reemplaza la calculadora pública por un formulario de solicitud de presupuesto con consentimiento; el owner recibe el lead y responde manualmente. Panel `/admin/presupuestos` con tabla `quote_requests` sin montos. Sin serverless nuevo: se extiende `contact-notify`. **Implementado 2026-10-24**: 616 tests verdes, coverage 93,28 % statements, typecheck/lint/build verdes; pendientes del owner: migración 0018, deploy de la función, Turnstile action quote, revisión legal y E2E real.


- [ ] [admin_quote_reference_20261025](tracks/admin_quote_reference_20261025/spec.md) — Referencia de presupuesto en panel admin (solo lectura)

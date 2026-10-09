# Plan: Hardening de seguridad (auditoría run-1)

> **Track ID:** `security_hardening_20261009`
> **Spec:** [./spec.md](./spec.md)
> **Status:** ✅ Completado (2026-10-09) + **reapertura por follow-ups del usuario (2026-10-09): Fase J (rate-limit DB 0007) y Fase K (desactivar passkeys)**.
> **Reglas:** TDD en código de app; migraciones siguen el patrón del repo ("aplicar y verificar"). Commits convencionales; build verde en cada commit (ver `conductor/workflow.md`).
> **Gate:** ninguna fase se marca `[x]` sin verificación manual del usuario (protocolo de checkpoint).

---

## Contexto

Remediación de los 8 leads `needs_validation` + hardening de la auditoría. Orden por dependencia y riesgo: DB (A) → cliente (B) → headers (C) → deploy (D) → tenancy (E) → passkey (F) → env (G) → validación (H) → docs (I).

Las **decisiones D1–D4** del `spec.md` se resuelven en la aprobación; cada tarea marcada "(D*)" espera esa decisión.

---

## Fase A — Migración `0005_security_hardening.sql`

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| A.1 | Trigger `guard_brief_admin_columns` (service_type/extra_ids admin-only) | `supabase/migrations/0005_security_hardening.sql` | ✅ |
| A.2 | Rehacer policy SELECT de `project_stages` con `client_visible` | idem | ✅ |
| A.3 | `subject` CHECK + trigger `normalize_contact_message` | idem | ✅ |
| A.4 | (D1) `drop column notes` | idem | ✅ |
| A.5 | Backup previo + aplicar migración + verificar policies | DB | ✅ (aplicada por el usuario en el SQL Editor) |
| A.6 | Commit `fix(db): tighten briefs column scope, stage visibility and contact intake` | — | ✅ |

---

## Fase B — Cliente / data layer

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| B.1 | TDD: validación de email en el submit | `src/components/ContactForm.test.tsx` | ✅ |
| B.2 | Implementar validación/normalización de email | `src/components/ContactForm.tsx` | ✅ |
| B.3 | TDD: `mailto` codifica el email (valores maliciosos neutralizados) | `src/pages/admin/MessagesPage.test.tsx` | ✅ |
| B.4 | Implementar href codificado | `src/pages/admin/MessagesPage.tsx` | ✅ |
| B.5 | (D1) Quitar `notes` del tipo, código y tests | `types.ts`, `ProjectDetailPage.tsx`, tests | ✅ |
| B.6 | Suite + commit `fix(messages): encode stored email in reply link` | — | ✅ |

---

## Fase C — Headers / CSP

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| C.1 | Quitar `onload` inline de `index.html` (fuente vía link estático) | `index.html` | ✅ |
| C.2 | Quitar `script-src-attr 'unsafe-inline'` de CSP | `vercel.json`, `netlify.toml` | ✅ |
| C.3 | TDD: `index.html` sin atributos `on*=` inline | `src/indexHtml.test.ts` | ✅ |
| C.4 | Build + commit `fix(csp): drop inline handler allowance` | — | ✅ |

---

## Fase D — Higiene de deploy

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| D.1 | Agregar exclusiones (`supabase`, `conductor`, `.agents`, `.opencode`, `.scratch`, `skills-lock.json`) | `.vercelignore` | ✅ |
| D.2 | Evaluar `.netlifyignore` | conclusión: no-op con `publish="dist"` (solo sube `dist/`) — no se crea archivo | ✅ |
| D.3 | Commit `chore(deploy): exclude non-release trees from upload context` | — | ✅ |

---

## Fase E — Tenancy por email (P1, D2)

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| E.1 | Chequear duplicados de `lower(email)` antes del índice | DB | ✅ |
| E.2 | Migración `0006_email_tenancy.sql` (índice único + trigger resync) | `supabase/migrations/` | ✅ |
| E.3 | Aplicar + verificar (índice, trigger y resync funcional con rollback) | DB | ✅ |
| E.4 | Nota en tech-stack sobre tenancy por email | `conductor/tech-stack.md` | ✅ |
| E.5 | Commit `fix(db): resync email tenancy on auth email change` | — | ✅ |

---

## Fase F — Passkey step-up (P1, D3)

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| F.1 | (D3) Decidir tras V3: implementar re-auth o documentar | — | ✅ cerrada: sin fix client-side real; documentada |
| F.2 | TDD + implementar re-auth antes de register/delete passkey (si aplica) | `src/lib/auth.tsx`, `AdminSecurityPage.tsx` (+ tests) | ❌ no aplica |
| F.3 | Commit `fix(auth): require step-up for passkey changes` | — | ❌ no aplica |

---

## Fase G — `envPrefix` (P1, D4)

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| G.1 | (D4) Documentar prefijos públicos y preparar migración a `PUBLIC_*` | `.env.example`, `src/vite-env.d.ts`, `vite.config.ts`, `tech-stack.md` | ✅ |
| G.2 | Commit `docs(config): clarify public env prefixes` | — | ✅ |

---

## Fase H — Anexo de validación (dueño)

| # | Tarea | Herramienta | Estado |
|---|-------|-------------|--------|
| H.1 | V1: método de deploy real | Vercel dashboard | ✅ Git integration (dump nunca sube) |
| H.2 | V2: Web3Forms domain-lock/cuota | Web3Forms dashboard | ✅ sin domain-lock; cuota 250/mes |
| H.3 | V3: Supabase passkeys + AAL | Supabase dashboard | ✅ habilitadas; AAL no expuesto; RP ID = vercel.app |
| H.4 | V4: migraciones aplicadas + RLS activo | SQL Editor | ✅ todas `rowsecurity = true` |
| H.5 | V5: reproducción local (briefs column-scope, stages visibility) | Postgres+PostgREST local | ✅ N/A (remediado en `0005`) |
| H.6 | Actualizar `REPORT.md`/`NEEDS-VALIDATION.md` con el cierre de cada lead | run-1 | ✅ addendum + punteros |

---

## Fase I — Docs + verificación final

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| I.1 | Checklist final: build, lint, test, typecheck, coverage ≥80% | — | ⬜ |
| I.2 | Actualizar estado del track en `tracks.md` + checkboxes | `tracks.md`, `plan.md` | ⬜ |
| I.3 | Resumen al usuario + commit docs | — | ⬜ |

---

## Fase J — Anti-abuse: rate limit por IP + subject nulo (lead #4)

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| J.1 | Migración `0007_contact_rate_limit.sql`: tabla `contact_rate_limits` + trigger `throttle_contact_messages` (x-forwarded-for, 5/min/IP) | `supabase/migrations/` | ✅ |
| J.2 | `check (subject is null)` (reemplaza el CHECK de longitud de 0005) | idem | ✅ |
| J.3 | Backup + aplicar + verificar (hits y rechazo >5 inserciones) | DB (SQL Editor) | ⬜ |
| J.4 | Commit `fix(db): rate-limit anonymous contact inserts` | — | ✅ `d0dec64` |

---

## Fase K — Desactivar passkeys (lead #8)

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| K.1 | Quitar flag `experimental.passkey` | `src/lib/supabase.ts` | ✅ |
| K.2 | Quitar estado/funciones de passkey del contexto + tests | `src/lib/auth.tsx`, `auth.test.tsx` | ✅ |
| K.3 | Quitar botón passkey del login + tests | `AdminLoginPage.tsx` (+test) | ✅ |
| K.4 | Eliminar `AdminSecurityPage`, ruta `/admin/seguridad` y nav | `AdminSecurityPage.tsx`(+test), `AppRouter.tsx`, `AdminLayout.tsx` | ✅ |
| K.5 | Quitar copy de passkey de `panel.ts` | `src/data/panel.ts` | ✅ |
| K.6 | Suite + commit `refactor(auth): disable passkey login and management` | — | ✅ `316c5ca` |
| K.7 | Notas en tech-stack/spec | `tech-stack.md`, `spec.md` | ⬜ |

---

## Verificación por fase (protocolo `workflow.md`)

Tras cada fase: resumen al usuario para verificación manual antes de marcar `[x]` y pasar a la siguiente. Las **migraciones (A.5, E.3, J.3)** requieren confirmación explícita del usuario antes de aplicarse.

## Riesgos

| Riesgo | Mitigación |
|--------|-----------|
| Índice único `lower(email)` con duplicados previos | E.1 lo detecta antes de aplicar |
| Resync de `projects.client_email` inesperado | Decisión D2 explícita + verificación del dueño |
| Quitar `notes` rompe tests | Cambio atómico tipo+código+tests |
| CSP rompe fuentes | Probar en `preview` local antes de cerrar C |
| Migraciones no aplicadas en remoto | Confirmación + backup previo |

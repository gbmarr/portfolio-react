# Plan: Endurecer almacenamiento de sesión

> **Track ID:** `sec_session_hardening_20261011`
> **Spec:** [./spec.md](./spec.md)
> **Status:** 🧪 En implementación (código listo; pendiente deploy y verificación en prod)

---

## Fase 0 — Evaluación

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T0.1 | Evaluar viabilidad de cookies httpOnly con Supabase (SSR/middleware vs. SPA puro) | `src/lib/supabase.ts` | ☑️ **No viable en SPA estática**: `supabase-js` client-side necesita leer la sesión desde JS; las cookies httpOnly exigen `@supabase/ssr` con server runtime, fuera del modelo estático (Vercel Hobby/Netlify). Se adopta PKCE + CSP estricta (ADR-0001). |
| T0.2 | Redactar ADR con la decisión y trade-offs | `conductor/decisions/0001-sesion-spa-sin-cookies-httponly.md` | ☑️ |

## Fase 1 — Implementación

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T1.1 | Migrar el flujo de auth a **PKCE** (tokens fuera de la URL del redirect) | `src/lib/supabase.ts` (+ test `src/lib/supabase.test.ts`) | ☑️ `flowType: 'pkce'` + test que pinea el runtime |
| T1.2 | Acotar `connect-src` al ref exacto de Supabase en CSP | `vercel.json`, `netlify.toml` (+ test `src/headersConfig.test.ts`) | ☑️ Sin `*.supabase.co`/`wss`; solo API + Edge Functions del ref `jntueibgkfwptigpncmh` |

## Fase V — Verificación

| # | Tarea | Herramienta | Estado |
|---|-------|-------------|--------|
| V.1 | `npm run test` / `typecheck` / `lint` + verificación de headers | npm | ☑️ **70 archivos / 467 tests verdes**; typecheck OK; lint OK; CSP verificada por `src/headersConfig.test.ts` |
| V.2 | Commit `feat(security): endurecer sesion/CSP (SEC-008)` + docs | git | ☐ |

---

## Riesgos

| Riesgo | Mitigación |
|--------|-----------|
| Cookies httpOnly + Supabase en SPA requiere cambios de arquitectura | **Verificado y documentado** (ADR-0001): se rechaza por inviabilidad en el modelo estático; mitigación con PKCE + CSP acotada + ausencia de sinks XSS |
| `connect-src` estricto rompe realtime (`wss`) | La app **no usa Realtime** (sin `.channel()`/`.subscribe()` en `src/`); si se incorpora, agregar `wss://jntueibgkfwptigpncmh.supabase.co` y actualizar el test |
| Cambio de proyecto/ref de Supabase rompe la CSP | El ref `jntueibgkfwptigpncmh` está versionado (ver ADR-0001 y track `own_email_notifications`); actualizar `vercel.json`/`netlify.toml` + test si el proyecto cambia |
| PKCE rompe magic links existentes | PKCE es compatible con `signInWithOtp` + `emailRedirectTo`; `detectSessionInUrl: true` ya está seteado; los verifiers se guardan en el mismo storage que la sesión |
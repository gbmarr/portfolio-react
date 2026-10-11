# ADR-0001 — Sesión en SPA: localStorage (no cookies httpOnly) + mitigaciones

> **Estado:** Aceptado
> **Fecha:** 2026-10-11
> **Track:** `sec_session_hardening_20261011` (SEC-008, CWE-522/539)
> **Decisión:** No migrar la sesión de Supabase a cookies `httpOnly` en el front; **endurecer el modelo actual** con flujo **PKCE** + **CSP `connect-src` acotada al ref exacto**.

---

## Contexto

- El portfolio es una **SPA estática** desplegada en Vercel (Hobby) y Netlify: no hay runtime Node/server propio.
- `supabase-js` (client-side) guarda la sesión en `localStorage` (`storageKey: 'portfolio-auth'`), accesible a JavaScript. Ante un XSS, el token de refresco podría exfiltrarse.
- Las cookies `httpOnly` **no puede leerlas JavaScript**: `supabase-js` no puede manejarlas en un cliente puro. Requerirían usar `@supabase/ssr` con server code (middleware/Edge) para cada request, lo que contradice el modelo estático del proyecto (cero serverless para el negocio según `conductor/fair-use.md`) y complica magic links, refresh y multi-pestaña.
- No hay sinks XSS conocidos hoy (React auto-escape; sin `dangerouslySetInnerHTML`/`eval`; CSP sin `unsafe-inline` en `script-src`).

## Decisión

1. **Conservar `localStorage`** para la persistencia de sesión (NFR: magic link, refresh y multi-pestaña intactos).
2. **Migrar el flujo de auth a PKCE** (`flowType: 'pkce'` en `supabase.ts`): los tokens **ya no aparecen en la URL** del redirect del magic link (solo un `code` de un solo uso + verifier en storage). Esto elimina la superficie de exfiltración por historial/referrer/URL compartida, además del riesgo de XSS por la reducción del surface.
3. **Acotar `connect-src`** al ref exacto del proyecto en la CSP de producción (`https://jntueibgkfwptigpncmh.supabase.co` + `https://jntueibgkfwptigpncmh.functions.supabase.co`), eliminando el comodín `https://*.supabase.co` y `wss://*.supabase.co`. La app **no usa Realtime** (sin `.channel()`/`.subscribe()`), por lo que no se incluye `wss`.
4. Documentar que **el ref del proyecto es fijo**; si se cambia de proyecto Supabase, hay que actualizar la CSP (y el test `src/headersConfig.test.ts`).

## Consecuencias

- **Positivas:** menor superficie de exfiltración; tokens fuera de URLs; CSP predecible y verificada por test; sin romper el flujo de auth actual.
- **Negativas / trade-offs:** la sesión sigue siendo accesible a JS en `localStorage` (riesgo residual **bajo** asumido, mitigado por la ausencia de sinks XSS + CSP); PKCE requiere que el `code_verifier` esté en el mismo almacenamiento del browser (igual que hoy); si se introduce Realtime en el futuro, habrá que volver a incluir `wss://<ref>.supabase.co` y actualizar el test.

## Verificación

- `src/headersConfig.test.ts`: `connect-src` acotado, sin `*.supabase.co`.
- `src/lib/supabase.test.ts`: `flowType === 'pkce'`.
- Suite completa verde + typecheck + lint (commit `SEC-008`).
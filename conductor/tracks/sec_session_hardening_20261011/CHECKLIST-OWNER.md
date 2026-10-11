# Checklist del owner — Track sec_session_hardening_20261011 (SEC-008)

> Código implementado y verificado (70 archivos / 467 tests). Quedan pasos de deploy/verificación que solo podés hacer vos.

## 1. Desplegar el front

- [ ] Push a `main` (Vercel/Netlify deployments).
- [ ] En produccion, ir al sitio y confirmar que **el login con magic link sigue funcionando** de punta a punta (el flujo PKCE intercambia el `code` en `/login` automáticamente con `detectSessionInUrl`).

## 2. Verificar la CSP acortada

- [ ] Curl a un recurso: `curl -sI https://gabrielmarrero.com.ar/ | findstr Content-Security-Policy`
      → esperado: `connect-src 'self' https://va.vercel-scripts.com https://vitals.vercel-insights.com https://challenges.cloudflare.com https://jntueibgkfwptigpncmh.supabase.co https://jntueibgkfwptigpncmh.functions.supabase.co;` (sin `*.supabase.co`).
- [ ] Entrar al **panel admin** (ya logueado de antes) y al **panel cliente**: si hay una sesión previa en `localStorage` de antes del deploy, debería seguir operando (el refresh sigue funcionando).
- [ ] Abrir DevTools → Network y confirmar que las llamadas a `*.supabase.co` **no** dan bloqueos de CSP.

## 3. Notas a futuro

- La sesión **sigue en `localStorage`** (decisión documentada en `conductor/decisions/0001-sesion-spa-sin-cookies-httponly.md`): el riesgo residual es bajo porque no hay sinks XSS y la CSP acotada limita exfiltración.
- Si algún dia el proyecto usa Realtime (`.channel()`/`.subscribe()`), hay que **agregar `wss://jntueibgkfwptigpncmh.supabase.co` a `connect-src`** en `vercel.json`/`netlify.toml` y actualizar `src/headersConfig.test.ts`.
- Si el proyecto de Supabase cambiara de ref, hay que actualizar la CSP y el test (el ref está anotado en el ADR).
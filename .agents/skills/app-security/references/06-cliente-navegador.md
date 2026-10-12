# 06 · Seguridad del lado del cliente (navegador)

## Amenazas
- **XSS** reflejado, almacenado, basado en DOM; mutation XSS (mXSS).
- **CSRF**.
- Clickjacking / UI redressing.
- Open redirect.
- CORS permisivo (`*` con credenciales, reflejo de `Origin`, `null`).
- `postMessage` sin validar origen; DOM clobbering; tabnabbing (`window.opener`).
- Inyección de scripts de terceros (Magecart, supply chain en el front, CDNs comprometidos).
- Almacenamiento sensible en el cliente (localStorage, IndexedDB, caché).
- Subdomain takeover; fugas por `Referer`.
- WebSockets sin validación de `Origin` (CSWSH).
- Service Workers maliciosos; XS-Leaks; fingerprinting.

## Controles
- Frameworks con escape automático; evitar `innerHTML`, `dangerouslySetInnerHTML`, `v-html`, `document.write`, `bypassSecurityTrust*`.
- **Trusted Types** y sanitizadores (DOMPurify) cuando el HTML sea inevitable.
- **CSP estricta**: nonces/hashes + `strict-dynamic`, sin `unsafe-inline`/`unsafe-eval`, `object-src 'none'`, `base-uri 'none'`, `frame-ancestors`, con `report-to`.
- **CSRF**: tokens (sincronizador o double-submit firmado) + `SameSite` + verificación de `Origin`/`Sec-Fetch-Site`; métodos seguros (GET) sin efectos; exigir `Content-Type: application/json` y headers personalizados en APIs.
- **Headers recomendados**:
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
  - `Content-Security-Policy: ...`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin` (o más estricto)
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()` (según necesidad)
  - `Cross-Origin-Opener-Policy: same-origin`, `Cross-Origin-Embedder-Policy`, `Cross-Origin-Resource-Policy`
  - `frame-ancestors` (CSP) o `X-Frame-Options: DENY`
  - `Cache-Control: no-store` en respuestas sensibles
- **CORS**: allowlist explícita de orígenes; nunca reflejar `Origin` sin validar; `Vary: Origin`; no `*` con credenciales.
- **SRI** (`integrity` + `crossorigin`) en scripts/estilos externos; minimizar terceros y aislarlos (iframes `sandbox`).
- Redirecciones contra allowlist de destinos (o rutas relativas).
- `rel="noopener noreferrer"` en `target="_blank"`.
- `postMessage`: verificar `event.origin` y esquema del mensaje; nunca `"*"` como `targetOrigin` con datos sensibles.
- Inventario y monitoreo de DNS (CNAME colgantes) contra subdomain takeover.
- No guardar tokens/PII sensible en storage del navegador; si es necesario, de corta vida y mínimo.
- WebSockets: validar `Origin` y autenticar en el handshake.

## Ejemplo CSP base
```
Content-Security-Policy: default-src 'self'; script-src 'nonce-{RANDOM}' 'strict-dynamic'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; require-trusted-types-for 'script'
```

## Anti-patrones (grep)
`innerHTML =`, `outerHTML`, `insertAdjacentHTML`, `document.write`, `dangerouslySetInnerHTML`, `v-html`, `eval(`, `setTimeout("`, `localStorage.setItem('token'`, `Access-Control-Allow-Origin: *`, `window.open(` sin noopener, `location = userInput`.

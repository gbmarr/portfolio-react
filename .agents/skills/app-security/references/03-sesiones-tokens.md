# 03 · Gestión de sesiones y tokens

## Amenazas
- Session fixation, hijacking, sesiones sin expiración.
- Cookies sin flags de seguridad.
- JWT mal implementados: `alg: none`, confusión HS/RS, claves débiles, falta de validación de `exp`/`nbf`/`aud`/`iss`, inyección en `jwk`/`jku`/`kid`.
- Tokens en `localStorage`/`sessionStorage` expuestos a XSS.
- Refresh tokens sin rotación ni detección de reuso.
- Logout que no invalida nada en el servidor.
- Tokens en URLs (se filtran por `Referer`, logs, historial).

## Controles
- Cookies: `HttpOnly`, `Secure`, `SameSite=Lax|Strict`, prefijo `__Host-`, `Path=/`, sin `Domain` si es posible.
- Regenerar el ID de sesión tras login y tras elevación de privilegios.
- Expiración por inactividad y absoluta; logout invalida el token en el servidor.
- Revocación de sesiones: listado de sesiones activas y "cerrar todas"; invalidar al cambiar contraseña/MFA.
- ID de sesión con ≥ 128 bits de entropía (CSPRNG).
- **JWT**: lista blanca de algoritmos (preferir EdDSA/ES256/RS256 para multi-servicio; HS256 solo con secreto fuerte ≥ 256 bits y un único emisor/consumidor); validar `iss`, `aud`, `exp`, `nbf`, `iat`; ignorar `jku/jwk/x5u` no confiables; rotación de claves con `kid` desde un JWKS propio; vida corta (5-15 min) para access tokens.
- **Refresh tokens**: rotación en cada uso, detección de reuso (invalida la familia), almacenamiento hasheado en servidor, vinculados a dispositivo.
- Preferir cookies `HttpOnly` sobre almacenamiento web para tokens en navegadores.
- **Sender-constrained tokens** (DPoP, mTLS) en escenarios sensibles.
- JWTs no son para datos sensibles (solo están firmados, no cifrados, salvo JWE).
- Para revocación inmediata: lista de denegación corta (`jti`) o sesiones con estado en servidor.

## Anti-patrones
- `jwt.decode()` sin `verify`; `algorithms` no especificados; secreto `"secret"`.
- Token de acceso con vida de días/semanas sin rotación.
- Guardar JWT en `localStorage` con CSP débil.
- Aceptar el rol/permisos del token sin consultar el estado actual del usuario cuando es crítico.

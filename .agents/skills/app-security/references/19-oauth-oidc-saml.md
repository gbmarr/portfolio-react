# 19 · Identidad federada: OAuth 2.0 / OIDC / SAML

## Amenazas
- `redirect_uri` laxo (wildcards, subdominios, open redirect encadenado); falta de `state` (CSRF de login) o de `nonce` (replay de ID token).
- *Authorization code interception* (sin PKCE); fuga de code/token por `Referer` o logs.
- *Implicit flow* y ROPC (password grant) obsoletos.
- Scopes excesivos; consentimiento engañoso (*illicit consent grants*, apps OAuth maliciosas).
- Confusión de IdP (*mix-up attacks*), confusión de tokens entre audiencias, uso de access token como prueba de identidad.
- Validación débil de ID tokens (firma, `iss`, `aud`, `exp`, `azp`).
- SAML: XML Signature Wrapping, falta de validación de firma/audiencia/destinatario/`InResponseTo`/`NotOnOrAfter`, replay de aserciones, parsers XML vulnerables (XXE), comentarios XML en NameID.
- Cuentas vinculadas por email sin verificar (*pre-account takeover*, *nOAuth*); account linking inseguro.
- Tokens de larga vida; refresh tokens robables.
- Client secrets en apps públicas (SPA/móvil).

## Controles
- **Authorization Code + PKCE (S256)** para todos los clientes, públicos y confidenciales. Evitar implicit y ROPC. Seguir OAuth 2.1 / BCP de seguridad (RFC 9700).
- **Validación exacta** (comparación literal) de `redirect_uri` registrada; `state` aleatorio vinculado a la sesión; `nonce` en OIDC.
- **ID token**: verificar firma con JWKS del IdP, `iss`, `aud` (= tu client_id), `exp`, `iat`, `nonce`; usar `sub` + `iss` como identificador estable (no email).
- Scopes mínimos; consentimiento claro; revisión periódica de apps autorizadas; restringir *consent* de usuarios en tenants corporativos.
- Access tokens de vida corta; **rotación de refresh tokens** con detección de reuso; revocación; DPoP/mTLS para tokens sensibles.
- Resource servers validan `aud` y scopes; introspección o validación local de JWT.
- **SAML**: librerías mantenidas, validar firma sobre el elemento correcto y la aserción completa, `Audience`, `Recipient`, `Destination`, `InResponseTo`, ventanas de tiempo, `ID` único para evitar replay; deshabilitar DTD; preferir OIDC si es posible.
- **Account linking**: vincular solo con identificadores verificados (`email_verified` + IdP confiable), con reautenticación del usuario; evitar auto-linking por email en IdPs que no verifican.
- Secretos de cliente en backend; clientes públicos sin secreto.
- Logout: back-channel/front-channel logout y revocación de sesiones locales.
- **Multi-tenant IdP**: validar `tid`/`iss` por tenant; no aceptar tokens de cualquier tenant.
- Proteger el endpoint de callback (CSRF, validación de estado, límites).

## Anti-patrones
`response_type=token`, `grant_type=password`, `redirect_uri` con regex/startsWith, aceptar `alg` del header del token, confiar en `email` sin `email_verified`, no verificar `aud`.

# Checklist rápido (línea base para cualquier sistema)

Marcar ✅ / ❌ / N/A. Cada ❌ es un hallazgo; profundizar en la referencia indicada.

## Identidad y acceso
- [ ] Contraseñas con Argon2id/bcrypt/scrypt/PBKDF2, sin límites absurdos de longitud (→ 02)
- [ ] MFA/passkeys en cuentas privilegiadas; recuperación de cuenta segura (→ 02)
- [ ] Rate limiting + bloqueo en login, registro, recuperación, OTP (→ 02, 17)
- [ ] Mensajes y tiempos uniformes (sin enumeración de usuarios) (→ 02)
- [ ] Cookies `HttpOnly; Secure; SameSite`, rotación de ID de sesión al login (→ 03)
- [ ] JWT: algoritmo fijo, `exp/aud/iss` validados, vida corta, refresh con rotación (→ 03)
- [ ] Autorización en servidor, deny-by-default, por objeto (anti IDOR/BOLA) (→ 04)
- [ ] Aislamiento entre tenants verificado con tests (→ 04)
- [ ] Mass assignment prevenido (DTO/allowlist de campos) (→ 04, 08)

## Datos de entrada/salida
- [ ] Queries parametrizadas / ORM; sin concatenar SQL/NoSQL/shell/LDAP (→ 05)
- [ ] Validación allowlist en servidor con esquema (→ 05)
- [ ] Escape contextual de salida; sin `innerHTML` con datos no confiables (→ 06)
- [ ] XML sin DTD/entidades externas; sin deserialización insegura (→ 05)
- [ ] Uploads: validación por contenido, nombres generados, fuera del webroot, límites (→ 07)
- [ ] SSRF: allowlist de destinos salientes; bloqueo de rangos privados/metadata (→ 07)
- [ ] Protección CSRF + CORS con allowlist (→ 06)
- [ ] Headers: HSTS, CSP, nosniff, Referrer-Policy, Permissions-Policy, frame-ancestors (→ 06)

## Criptografía y secretos
- [ ] TLS 1.2+ (ideal 1.3) en todo; HSTS (→ 09)
- [ ] Cifrado en reposo para datos sensibles; claves en KMS/HSM (→ 09)
- [ ] CSPRNG para tokens/IDs de seguridad (→ 09)
- [ ] Sin secretos en repo/logs/imágenes/front; secret scanning activo (→ 10)
- [ ] Credenciales efímeras/federadas en CI/CD y cloud (→ 10)

## APIs y lógica
- [ ] Inventario de APIs; sin versiones olvidadas/shadow (→ 08)
- [ ] Rate limits, paginación obligatoria, límites de payload y timeouts (→ 08, 17)
- [ ] Respuestas con solo los campos necesarios (→ 08)
- [ ] Webhooks firmados (HMAC + timestamp + anti-replay) (→ 08)
- [ ] Lógica crítica (precios, saldos, descuentos) calculada en backend; transacciones/idempotencia (→ 11)

## Cadena de suministro y operación
- [ ] Lockfiles, SCA continuo, SBOM, revisión de dependencias nuevas (→ 12)
- [ ] CI/CD con mínimo privilegio, acciones fijadas por hash, ramas protegidas (→ 12, 13)
- [ ] SAST/DAST/IaC scan/container scan en pipeline (→ 13)
- [ ] Contenedores no-root, imágenes mínimas y escaneadas; IAM mínimo (→ 14)
- [ ] Debug off, errores genéricos, sin endpoints de diagnóstico expuestos (→ 18)
- [ ] Logs de seguridad centralizados, sin secretos/PII innecesaria, con alertas (→ 16)
- [ ] Backups cifrados, inmutables y restaurados en pruebas (→ 14, 17)
- [ ] Plan de respuesta a incidentes y contacto de seguridad (`security.txt`) (→ 01, 16)

## Privacidad
- [ ] Minimización, retención definida, base legal, derechos del titular (→ 20)
- [ ] Inventario de datos personales y de terceros/encargados (→ 20)

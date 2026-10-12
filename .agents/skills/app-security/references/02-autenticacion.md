# 02 · Autenticación

## Amenazas
- Credential stuffing, fuerza bruta, password spraying.
- Contraseñas débiles, reutilizadas o filtradas.
- Enumeración de usuarios (mensajes de error, tiempos de respuesta, registro, recuperación).
- Recuperación de cuenta insegura (preguntas secretas, tokens predecibles o sin expiración).
- Bypass de MFA: fatiga de push, SIM swapping, phishing en tiempo real/AiTM, códigos reutilizables, brute force de OTP.
- Cuentas por defecto o hardcodeadas.
- Autenticación rota en flujos alternativos (API, móvil, legacy, endpoints de versiones viejas).
- Pre-account takeover (registro previo con email de la víctima).

## Controles
- **Hashing**: Argon2id (preferido), scrypt, bcrypt o PBKDF2 con parámetros actuales; sal única por usuario; *pepper* opcional en KMS. Reconfigurar costos periódicamente y re-hashear en el login.
- **Política NIST 800-63B**: longitud mínima ≥ 8-15 (ideal ≥ 12), permitir ≥ 64 caracteres y Unicode, sin reglas de composición arbitrarias, sin expiración periódica forzada, chequeo contra listas filtradas (HIBP k-anonymity), permitir pegar contraseñas/gestores.
- **MFA** obligatoria en cuentas privilegiadas y ofrecida a todos. Preferir **passkeys/WebAuthn/FIDO2**; TOTP como alternativa; SMS solo como último recurso. Limitar intentos de OTP, expiración corta, un solo uso, number matching en push.
- **Anti-automatización**: rate limiting por cuenta + IP + dispositivo, bloqueo progresivo (no lockout permanente que habilite DoS), CAPTCHA adaptativo, detección de bots, reputación de IP.
- **Respuestas uniformes** (mensaje, código HTTP y tiempo) en login, registro y recuperación; comparar hashes de dummy cuando el usuario no existe.
- **Recuperación**: token aleatorio CSPRNG ≥ 128 bits, un solo uso, vida corta (≤ 15-60 min), vinculado al usuario, almacenado hasheado; invalidar sesiones al resetear; notificar al usuario. Sin preguntas secretas.
- **Reautenticación / step-up** para acciones sensibles (cambio de email, contraseña, pagos, exportación de datos).
- **Notificaciones** ante login desde dispositivo nuevo, cambio de credenciales o MFA.
- Verificación de email/teléfono en el registro antes de vincular identidades.
- Eliminar credenciales por defecto; forzar cambio en primer uso.
- Paridad de controles en todos los canales (web, móvil, API, legacy).
- SSO centralizado (OIDC/SAML) con IdP robusto cuando aplique (→ 19).

## Anti-patrones (señales en código)
- `md5(`, `sha1(`, `sha256(password` sin KDF; comparación de strings con `==` para tokens (usar comparación en tiempo constante).
- Mensajes distintos: "usuario no existe" vs "contraseña incorrecta".
- Tokens de reset con `Math.random()`, timestamps o IDs incrementales.
- Login sin límite de intentos; OTP de 4 dígitos sin límite.
- Contraseñas en logs, URLs o respuestas de API.

## Ejemplo (Node/TypeScript, hashing)
```ts
import argon2 from "argon2";
const hash = await argon2.hash(password, { type: argon2.argon2id, memoryCost: 19456, timeCost: 2, parallelism: 1 });
const ok = await argon2.verify(storedHash, password); // tiempo constante interno
```

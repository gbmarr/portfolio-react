# 09 · Criptografía y protección de datos

## Amenazas
- Algoritmos obsoletos (MD5, SHA-1 para seguridad, DES/3DES, RC4, ECB, RSA < 2048, DH < 2048).
- Claves hardcodeadas, débiles o reutilizadas entre entornos.
- Aleatoriedad insegura (`Math.random`, `rand()`, `random.random`, `java.util.Random`).
- IV/nonce reutilizado (AES-GCM), cifrado sin autenticación (CBC sin MAC → padding oracle), comparaciones no constantes de MAC/tokens.
- TLS mal configurado (SSLv3/TLS 1.0/1.1, cifrados débiles, validación de certificado deshabilitada, hostname no verificado).
- Datos sensibles en claro (reposo, tránsito, backups, logs, caché, memoria, volcados, analítica).
- Datos en URLs, mensajes de error, headers y referers.
- *Downgrade attacks*; timing attacks.

## Controles
- **TLS 1.2+ (preferible 1.3)**, HSTS con preload, certificados automatizados (ACME) y monitoreo de expiración, Certificate Transparency; nunca `verify=False`/`rejectUnauthorized: false`/`InsecureSkipVerify` en producción.
- **Cifrado en reposo**: AES-256-GCM o ChaCha20-Poly1305 (AEAD); *envelope encryption* con **KMS/HSM**; rotación y separación de funciones; cifrado de disco y de backups.
- **Cifrado a nivel de campo** para datos críticos (PAN, DNI/CUIL, salud, credenciales de terceros); **tokenización** cuando corresponda.
- **CSPRNG** para tokens, IDs de reset, nonces, claves (`crypto.randomBytes`, `secrets`, `SecureRandom`, `crypto/rand`).
- **Librerías probadas** (libsodium, Tink, `cryptography`, WebCrypto, primitivas de la plataforma). Nunca criptografía propia ni modos manuales.
- **Ciclo de vida de claves**: generación, almacenamiento, rotación, revocación, destrucción; claves distintas por entorno y propósito.
- **Hashing**: contraseñas con KDF (→ 02); integridad con SHA-256/SHA-3/BLAKE2; MAC con HMAC-SHA-256; firmas con Ed25519/ECDSA P-256/RSA-PSS ≥ 2048 (ideal 3072).
- **Minimización de datos** y **retención limitada**; borrado seguro y crypto-shredding.
- **Enmascarado** de datos en UI, logs y entornos no productivos; datos de prueba sintéticos.
- **Backups** cifrados, aislados e inmutables, con pruebas de restauración.
- **Crypto-agility** e inventario criptográfico; plan de migración a criptografía post-cuántica (ML-KEM/ML-DSA, modo híbrido) para datos de larga vida.
- Comparación de secretos/MACs en tiempo constante (`hmac.compare_digest`, `crypto.timingSafeEqual`).
- No poner datos sensibles en URLs/query strings; `Cache-Control: no-store` para respuestas sensibles.

## Anti-patrones (grep)
`MD5`, `SHA1`, `DES`, `ECB`, `Math.random`, `rand(`, `verify=False`, `rejectUnauthorized: false`, `InsecureSkipVerify`, `TLSv1`, `"AES/CBC/PKCS5Padding"` sin MAC, IV constante, claves en código (`SECRET_KEY = "`).

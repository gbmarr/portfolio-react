# 08 · Seguridad de APIs (REST, GraphQL, gRPC, WebSocket, webhooks)

## Amenazas (OWASP API Top 10 · 2023)
- API1 BOLA · API2 Autenticación rota · API3 BOPLA (exposición excesiva de propiedades y mass assignment) · API4 Consumo irrestricto de recursos · API5 BFLA · API6 Acceso irrestricto a flujos de negocio sensibles · API7 SSRF · API8 Mala configuración · API9 Gestión inadecuada del inventario (shadow/zombie/versiones viejas) · API10 Consumo inseguro de APIs de terceros.
- **GraphQL**: introspección abierta en prod, queries profundas/anidadas, *batching* y *alias overloading* (fuerza bruta/rate limit bypass), sugerencias de campos, autorización solo a nivel de query y no de campo, inyección vía resolvers.
- **Webhooks** falsificados o con *replay*; SSRF en destinos de webhook configurables por usuario.
- Excesiva exposición de datos en respuestas; verbose errors.
- Versiones antiguas sin parches ni controles.
- Endpoints de administración/diagnóstico accesibles públicamente.

## Controles
- **Inventario** y catálogo de APIs (OpenAPI) detrás de un API gateway; retiro formal de versiones antiguas.
- **Validación de esquema** en request y response; rechazar propiedades desconocidas.
- **Rate limiting y cuotas** por usuario/token/IP/endpoint; límites de payload, paginación obligatoria con tope, timeouts, límites de concurrencia; protección de flujos sensibles (registro, compra, envío de SMS/emails).
- **Autenticación** consistente (OAuth2/OIDC, mTLS entre servicios); tokens de corta vida; no API keys en URL.
- **Autorización** por objeto y por propiedad en cada operación (→ 04).
- Respuestas mínimas: DTOs de salida, no serializar entidades de BD directamente.
- **GraphQL**: límites de profundidad y complejidad/costo, *persisted queries* (allowlist), introspección y sugerencias off en prod, límites de alias/batch, autorización por campo, timeouts por resolver.
- **Webhooks**: firma HMAC (SHA-256) sobre el body crudo + timestamp con ventana corta + comparación en tiempo constante + nonce/ID de evento para evitar replay; idempotencia; allowlist de IPs si el proveedor lo ofrece. Para webhooks salientes: validar destino (SSRF), reintentos con backoff, firma propia.
- **gRPC**: TLS/mTLS, interceptores de authN/authZ, límites de tamaño de mensaje, reflexión desactivada en prod.
- **WebSockets**: autenticación en handshake, validación de `Origin`, autorización por mensaje, límites de tamaño y frecuencia.
- Datos de terceros tratados como **no confiables**: validar, limitar tamaño, timeouts, circuit breakers.
- Errores consistentes sin detalles internos; CORS y headers (→ 06, 18).
- Idempotency keys para operaciones de escritura sensibles (pagos).

## Preguntas de revisión
- ¿Cada endpoint tiene authN, authZ por objeto, validación de esquema y rate limit?
- ¿Puede un usuario listar/exportar recursos sin paginación o filtros de tenant?
- ¿Hay endpoints `/v1`, `/internal`, `/admin`, `/debug`, `/actuator`, `/swagger` expuestos?
- ¿Las respuestas devuelven campos que el cliente no necesita (hash, flags internos, PII)?

# 03 · Abuso de autenticación y autorización (enfoque de pruebas)

Catálogo de controles: `../../app-security/references/02, 03, 04, 19`. Aquí: **qué probar y cómo pensar**.

## Preparación
- Mínimo 2 usuarios por rol y 2 tenants. Un admin de prueba.
- Registrar tokens/cookies de cada uno para pruebas cruzadas.
- Mapear todas las operaciones con IDs (path, query, body, cabeceras, GraphQL, archivos, URLs prefirmadas).

## Autenticación — matriz de pruebas
| Área | Pruebas (en entorno autorizado) |
|---|---|
| Registro | Email existente (¿respuesta/tiempo distintos?), variantes de email (`+`, mayúsculas, Unicode), registro con email ajeno (pre-ATO), verificación saltable |
| Login | Mensajes/tiempos diferentes, rate limit por cuenta/IP/dispositivo, bypass con cabeceras de IP (`X-Forwarded-For`), lockout como DoS |
| MFA | Límite de intentos de OTP, reuso de código, validez de código tras expirar, bypass al saltar el paso (acceder directo a la ruta posterior), flujos alternativos (API/móvil) sin MFA, recuperación que desactiva MFA |
| Recuperación | Predecibilidad y expiración del token, reuso, vinculación al usuario, host header en el link, enumeración, invalidación de sesiones al resetear |
| Cambio de credenciales | Exige contraseña actual / reautenticación, notificación, invalida sesiones |
| Paridad de canales | Web vs API vs móvil vs endpoints legacy con los mismos controles |
| Cuentas por defecto | Credenciales de fábrica, cuentas demo, usuarios de servicio |

## Sesiones y tokens — pruebas
- **Cookies**: flags, `Domain`/`Path`, fijación (ID antes/después del login).
- **JWT**: ¿se valida la firma? ¿`alg`? ¿`exp`/`aud`/`iss`? ¿`kid`/`jku`? ¿claims (rol, tenant, userId) confiables desde el cliente? ¿se acepta un token de otro entorno/servicio?
- **Revocación**: tras logout/cambio de contraseña, ¿sigue funcionando el token? ¿Refresh tokens rotan y detectan reuso?
- **Confusión de audiencia**: token emitido para el servicio A funciona en B.

## Autorización — enfoque sistemático
1. **Matriz rol × recurso × acción** y probar cada celda con: propietario, otro usuario del mismo rol, otro tenant, rol inferior, sin autenticar.
2. **BOLA/IDOR**: sustituir cada ID por uno de otro usuario/tenant en todas las ubicaciones; probar IDs de objetos *relacionados* (hijos, adjuntos, facturas, mensajes), IDs en arrays y en endpoints de búsqueda/exportación.
3. **BFLA**: llamar funciones administrativas con tokens de rol bajo; cambiar el método HTTP (GET→PUT/DELETE/PATCH); rutas alternativas (`/admin/`, `/internal/`, versiones antiguas).
4. **BOPLA / mass assignment**: añadir `role`, `isAdmin`, `tenantId`, `ownerId`, `price`, `status`, `verified`, `credits` al body; comparar campos en respuesta (¿hay datos que no deberían salir?).
5. **Multi-tenant**: filtros por tenant en listados, búsquedas, exports, archivos, caché, notificaciones, webhooks, logs, jobs.
6. **Indirectos**: URLs prefirmadas sin expiración, enlaces públicos "compartir", tokens de invitación, descargas de reportes.
7. **Cadenas de estado**: acceder a pasos posteriores (pago, aprobación) sin completar los anteriores.
8. **Jobs/colas/webhooks internos** sin chequeo de identidad del actor original (confused deputy).
9. **GraphQL**: autorización por campo y por resolver, alias/batching, relaciones anidadas que saltan chequeos.

## Señales de debilidad frecuentes
- IDs secuenciales + sin filtro por owner.
- Respuestas 200 con datos de otro usuario o 403 vs 404 distintos (filtran existencia).
- Roles en el JWT que no se vuelven a validar.
- Controles solo en el front-end.
- Endpoints de "soporte" con permisos globales.

## Evidencia mínima
Usá objetos **propios** de dos cuentas de prueba para demostrar el acceso cruzado. No extraer datos de usuarios reales. Capturar request/response enmascarados.

## Remediación (puntero)
Autorización centralizada deny-by-default por objeto y propiedad; DTOs; políticas (OPA/Cedar/OpenFGA); tests automatizados de matriz (→ app-security/04).

# 02 · Cadenas de ataque (attack chains)

Formato por cadena: **Precondición → Eslabones → Impacto → Dónde se corta → Detección**. Referencias a los controles en `../../app-security/references/`.

## Catálogo

### C1 · Fuga de ID + IDOR → exposición masiva de datos
- **Pre:** cuenta de usuario normal.
- **Eslabones:** endpoint de búsqueda/listado revela IDs de otros (sin paginación o con respuestas verbosas) → endpoints de detalle sin autorización por objeto (BOLA) → exportación o API de archivos sin chequeo.
- **Impacto:** lectura/modificación de datos de otros usuarios/tenants.
- **Corte:** autorización por objeto centralizada; DTOs de salida; paginación con tope (→ 04, 08).
- **Detección:** acceso a muchos IDs distintos desde un mismo token; 403/404 anómalos; ratio de objetos únicos por sesión.

### C2 · SSRF → metadatos cloud → credenciales → movimiento lateral
- **Pre:** funcionalidad que hace requests a URLs elegidas por usuario (preview, webhook, importador, generador de PDF/imagen).
- **Eslabones:** SSRF sin allowlist → acceso al servicio de metadatos (IMDSv1) → credenciales del rol → permisos IAM amplios → lectura de buckets/secretos/BD.
- **Impacto:** compromiso de la cuenta cloud.
- **Corte:** allowlist de destinos + bloqueo de rangos internos, IMDSv2, rol con mínimo privilegio, egress filtering (→ 07, 14).
- **Detección:** requests salientes a 169.254.169.254 o rangos privados desde la app; uso del rol desde IP/ASN inusual; llamadas IAM/STS atípicas.

### C3 · XSS almacenado en contexto privilegiado → toma de cuenta admin
- **Pre:** campo que un admin/soporte visualiza (tickets, nombres, comentarios, logs).
- **Eslabones:** XSS almacenado → ejecución en sesión de admin → acciones vía API con CSRF/cookies/tokens accesibles (sin `HttpOnly`, sin CSP, sin step-up) → creación de usuario admin o exfiltración.
- **Impacto:** control administrativo.
- **Corte:** escape/sanitización, CSP estricta con nonces, `HttpOnly`, reautenticación para acciones sensibles (→ 02, 06).
- **Detección:** cambios de privilegios, creación de admins, requests de admin desde IP o user-agent no habitual; reportes CSP.

### C4 · Recuperación de cuenta débil → account takeover → fraude
- **Pre:** conocer el email/usuario de la víctima.
- **Eslabones:** enumeración de usuarios → tokens de reset predecibles/sin expiración, o host header injection en el link → toma de cuenta → cambio de datos de pago/retiro (sin step-up).
- **Impacto:** ATO y fraude financiero.
- **Corte:** respuestas uniformes, tokens CSPRNG de un solo uso, links con host fijo, MFA/step-up en cambios sensibles, notificaciones (→ 02).
- **Detección:** picos de resets por IP/ASN, cambios de contacto seguidos de retiros, cambios de dispositivo.

### C5 · Vinculación de cuentas por email sin verificar (pre-account takeover / nOAuth)
- **Pre:** registro con el email de la víctima antes de que ella se registre, o IdP que no verifica el email.
- **Eslabones:** cuenta pre-creada → la víctima entra por SSO → ambas cuentas se enlazan por email → acceso del atacante.
- **Corte:** vincular con `iss+sub` y `email_verified`, reautenticación en linking (→ 19).
- **Detección:** múltiples métodos de login vinculados en poco tiempo; sesiones activas previas al enlace.

### C6 · Secreto filtrado en repo/imagen/bundle → API/cloud → datos
- **Pre:** acceso de lectura a un repo (o historial), imagen, app móvil o JS público.
- **Eslabones:** clave estática encontrada → uso directo contra API/cloud → permisos excesivos → exfiltración/escalada.
- **Corte:** secret scanning con push protection, credenciales efímeras, mínimo privilegio, rotación (→ 10).
- **Detección:** uso del secreto desde IP/ASN nuevo; llamadas fuera de patrón horario; alertas de proveedor (GitHub, AWS).

### C7 · Compromiso de CI/CD → inyección en build → backdoor en producción
- **Pre:** capacidad de abrir PRs/forks o controlar una dependencia/acción.
- **Eslabones:** workflow con `pull_request_target`/interpolación insegura o acción sin pin → ejecución con secretos → modificación de artefactos/releases → despliegue.
- **Impacto:** ejecución en producción y robo de secretos.
- **Corte:** permisos mínimos del token, acciones fijadas por hash, sin secretos en forks, entornos con aprobación, firma/procedencia (→ 12, 13).
- **Detección:** cambios en workflows, runs desde forks con acceso a secretos, artefactos sin atestación válida.

### C8 · Mass assignment + falta de validación de estado → escalada de privilegios
- **Pre:** cuenta normal.
- **Eslabones:** endpoint de actualización acepta campos extra (`role`, `plan`, `balance`, `tenantId`) → cambio de rol/plan/propietario → acceso a funciones admin o gratuitas.
- **Corte:** DTOs con allowlist, autorización por propiedad (→ 04, 08).
- **Detección:** cambios de campos protegidos fuera de flujos autorizados.

### C9 · Race condition → doble gasto / cupón reutilizable
- **Pre:** operación con saldo, stock o límite (cupón, retiro, voto).
- **Eslabones:** requests paralelos pasan el chequeo antes de que se descuente el recurso → múltiples usos.
- **Corte:** transacciones atómicas, bloqueos, restricciones únicas, idempotency keys (→ 07, 11).
- **Detección:** múltiples operaciones del mismo recurso en ventanas de milisegundos; saldos negativos; reconciliación.

### C10 · Upload inseguro → ejecución o XSS persistente
- **Pre:** carga de archivos.
- **Eslabones:** validación solo por extensión/Content-Type → archivo activo (SVG/HTML con JS, script en webroot) servido desde el mismo origen → XSS o ejecución en servidor.
- **Corte:** validación por contenido, re-encode, almacenamiento fuera del webroot, dominio de contenido aparte, `nosniff` y `attachment` (→ 07).
- **Detección:** subidas con tipos inesperados, accesos a archivos recién subidos con ejecución.

### C11 · Agente de IA con herramientas → inyección indirecta → exfiltración o acción no autorizada
- **Pre:** agente que lee contenido externo (email, web, tickets, documentos) y tiene herramientas.
- **Eslabones:** contenido con instrucciones ocultas → el agente las sigue → usa una herramienta con permisos amplios (enviar email, leer archivos, llamar APIs) → exfiltra o modifica datos, o renderiza links/imagenes con datos en la URL.
- **Corte:** permisos del usuario final, mínimo privilegio por herramienta, aprobación humana, aislamiento de contexto, bloqueo de egress y de render automático (→ 21).
- **Detección:** tool calls fuera de patrón tras ingerir contenido externo; salidas con URLs a dominios no aprobados.

### C12 · Subdomain takeover → cookies/OAuth → toma de sesión
- **Pre:** registro DNS apuntando a un servicio dado de baja.
- **Eslabones:** takeover del subdominio → cookies con `Domain=.empresa.com` o `redirect_uri` con wildcard → robo de sesión/código OAuth.
- **Corte:** inventario DNS, cookies `__Host-`, `redirect_uri` exacta (→ 06, 19).
- **Detección:** monitoreo de CNAME colgantes; cambios DNS; sesiones desde subdominios inesperados.

### C13 · Versión antigua de API sin controles → bypass de rate limit/authZ
- **Pre:** conocer o deducir `/v1/` cuando existe `/v3/`.
- **Eslabones:** versión vieja sin validación moderna → acceso a datos o funciones → saltar MFA o límites.
- **Corte:** inventario, retiro de versiones, paridad de controles (→ 08).
- **Detección:** tráfico a versiones deprecadas desde clientes no oficiales.

### C14 · Insider/soporte con acceso amplio → exfiltración sin trazabilidad
- **Pre:** rol de soporte o administración.
- **Eslabones:** panel que permite ver/exportar datos masivos sin justificación ni límites → exportación → fuga.
- **Corte:** mínimo privilegio, JIT/PAM, justificación por acceso, límites de exportación, auditoría inmutable (→ 16, 22).
- **Detección:** volumen de accesos por agente de soporte, exportaciones fuera de horario.

## Cómo construir una cadena nueva
1. Elegir la corona y el perfil de atacante.
2. Listar sus **primitivas** disponibles: leer X, escribir Y, ejecutar en Z, obtener identidad W.
3. Preguntar para cada primitiva: ¿qué nueva primitiva desbloquea? (lectura de ID → acceso a objeto; acceso a objeto → lectura de token; token → API; API → cloud).
4. Buscar el **choke point**: el eslabón común a más cadenas.
5. Anotar detección para cada eslabón.

## Plantilla rápida
```
Corona: <objetivo>   Atacante: <perfil>   Precondición: <...>
E1 → E2 → E3 → Impacto
Corte recomendado (choke point): <...>
Detección: <log/alerta por eslabón>
```

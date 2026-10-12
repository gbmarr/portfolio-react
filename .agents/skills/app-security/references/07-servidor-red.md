# 07 · Vulnerabilidades del lado del servidor y de red de aplicación

## Amenazas
- **SSRF** (metadatos cloud `169.254.169.254`, servicios internos, DNS rebinding, redirecciones, esquemas `file://`, `gopher://`, IPv6/decimal/hex/octal).
- Path traversal, LFI/RFI, zip slip / tar slip, symlink attacks.
- **Carga de archivos insegura**: webshells, polyglots, MIME spoofing, SVG/HTML con JS, bombas de descompresión, malware, imágenes con payload (ImageTragick), XXE en docx/xlsx/svg.
- HTTP request smuggling / desync; Host header injection; web cache poisoning y cache deception.
- **Race conditions / TOCTOU** (doble gasto, cupones, límites, creación de recursos).
- Acceso a backups, `.git`, `.env`, `.DS_Store`, paneles de admin, consolas de debug.
- Listado de directorios; HTTP verb tampering; content-type sniffing.
- Open proxies y SSRF a través de generadores de PDF/imágenes/previews de URL, importadores, webhooks.

## Controles
- **SSRF**: allowlist de hosts/esquemas/puertos salientes; resolver DNS una vez y conectar a la IP validada (anti-rebinding); bloquear rangos privados, loopback, link-local, metadata; no seguir redirecciones ciegamente; **IMDSv2** (hop limit 1) en AWS; egress filtering a nivel de red; ejecutar fetchers en entornos aislados sin credenciales.
- **Uploads**: almacenar fuera del webroot o en object storage privado; nombre generado (UUID), extensión por allowlist, validar tipo por contenido (*magic bytes*), límite de tamaño y de cantidad, reprocesar imágenes (re-encode), escaneo antivirus, dominio separado sin cookies para servir, `Content-Disposition: attachment` y `nosniff`; descomprimir con límites de tamaño/ratio/archivos y verificación de rutas.
- **Rutas**: `realpath`/`Path.resolve()` + verificación de prefijo del directorio base; nunca usar input en rutas sin mapear a IDs.
- **Smuggling/cache**: proxies y servidores actualizados y consistentes en parsing; preferir HTTP/2 end-to-end; rechazar requests ambiguos; claves de caché que incluyan los headers que varían la respuesta; no cachear respuestas con datos de usuario.
- **Host header**: validar contra allowlist; no usar `Host` para generar links de reset de contraseña (usar configuración fija).
- **Race conditions**: transacciones con nivel de aislamiento adecuado, `SELECT ... FOR UPDATE`, locks, operaciones atómicas, *idempotency keys*, restricciones únicas en base de datos.
- Eliminar artefactos de desarrollo, backups y archivos temporales de producción; denegar dotfiles en el servidor web.
- Desactivar listado de directorios y métodos HTTP innecesarios.
- Límites en parsers XML/JSON (tamaño, profundidad, cantidad de elementos).

## Anti-patrones (grep)
`requests.get(user_url`, `fetch(req.body.url`, `file_get_contents($_GET`, `open(user_path`, `os.path.join(base, user`, `extractall(`, `move_uploaded_file` con nombre original, `sendFile(req.params`, `Content-Type` tomado del cliente.

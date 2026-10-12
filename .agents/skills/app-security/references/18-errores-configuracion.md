# 18 · Manejo de errores y configuración segura

## Amenazas
- Stack traces, versiones, rutas, consultas SQL y variables de entorno expuestas en respuestas.
- Modo debug o endpoints de diagnóstico (`/actuator`, `/debug`, `/metrics`, `phpinfo`, `/swagger`, `/graphiql`, `/console`) en producción.
- Credenciales y configuraciones por defecto; cuentas demo.
- CORS/headers/TLS laxos; HTTP sin redirección a HTTPS; cookies sin flags.
- Banners y *fingerprinting* de tecnologías (Server, X-Powered-By).
- Entornos de test/staging expuestos a internet o con datos reales.
- Fallos "abiertos" (*fail-open*) ante excepciones de autorización o servicios caídos.
- Configuración divergente entre entornos; feature flags sin control.

## Controles
- **Errores genéricos** al usuario (ID de correlación) y detalle solo en logs; handler global de excepciones; mismo formato de error siempre.
- **Configuración como código**, baselines de hardening, revisión por entorno, validación de configuración al arranque (fail-fast si falta algo crítico).
- **Fail-secure / fail-closed**: ante error en autenticación/autorización, denegar.
- Eliminar funcionalidades, puertos, servicios, muestras y endpoints no usados; deshabilitar métodos HTTP innecesarios; ocultar versiones.
- **Separación estricta de entornos** (cuentas, redes, credenciales y datos); staging protegido (VPN/SSO/IP allowlist).
- Endpoints operativos (health, metrics, admin) en puerto/red interna o con autenticación; exponer solo `/health` mínimo.
- Debug/profilers/herramientas de desarrollo desactivadas en producción (`DEBUG=False`, `NODE_ENV=production`).
- Secretos y configuración sensible fuera del código (→ 10).
- Revisión de configuración de frameworks (CSRF, CORS, cookies, hosts permitidos, `ALLOWED_HOSTS`, `trustProxy`).
- Escaneos de configuración periódicos (CIS, Lynis, ScoutSuite, Prowler, kube-bench).
- Feature flags con control de acceso, auditoría y expiración.

## Anti-patrones
`DEBUG = True`, `app.use(errorhandler())` en prod, `res.send(err.stack)`, `catch (e) { return true; }` en chequeos de permisos, `management.endpoints.web.exposure.include=*`.

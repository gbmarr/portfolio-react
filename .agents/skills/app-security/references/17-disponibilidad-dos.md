# 17 · Disponibilidad, resiliencia y denegación de servicio

## Amenazas
- DDoS volumétrico, de protocolo (SYN flood) y de capa 7 (HTTP floods).
- DoS por recursos: payloads gigantes, regex catastróficas, consultas costosas/N+1, `zip bombs`, GraphQL profundo, paginación sin tope, exports masivos, generación de PDF/imagen, uploads grandes.
- Agotamiento de conexiones, hilos, memoria, disco, descriptores, cuotas cloud, conexiones a BD ("denial of wallet").
- *Slowloris*, amplificación (DNS/NTP), *account lockout DoS*.
- Puntos únicos de falla, dependencias de terceros, fallos en cascada, *retry storms*.
- Fallo de certificados/DNS/expiraciones.

## Controles
- **CDN/WAF/anti-DDoS** (Cloudflare, AWS Shield/CloudFront, Cloud Armor, Akamai), *rate limiting* y *backpressure*, bot management.
- **Límites** de tamaño de request/body/headers, profundidad y complejidad de entradas, número de elementos, paginación con tope, timeouts de lectura/escritura/handler (anti-Slowloris).
- **Resiliencia**: timeouts en toda llamada externa, *circuit breakers*, *bulkheads*, colas, reintentos con *backoff* exponencial y jitter, degradación elegante, *load shedding*.
- **Autoscaling con topes** y presupuestos/alertas de costos.
- **Consultas**: índices, límites, timeouts de statements, read replicas, caché; cancelación de requests costosos; cuotas por tenant (noisy neighbor).
- **Alta disponibilidad**: redundancia multi-AZ/región, health checks, sin SPOF, DR con **RTO/RPO** definidos y probados, **chaos engineering**.
- **Monitoreo** de SLO/SLI, alertas de saturación (CPU, memoria, conexiones, colas).
- **Lockout** de cuentas progresivo y por IP/dispositivo en vez de bloqueo total permanente.
- Gestión de expiración de certificados y dominios; runbooks de DNS.
- Pruebas de carga y de estrés periódicas (incluyendo escenarios de abuso).

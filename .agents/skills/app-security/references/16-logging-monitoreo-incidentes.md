# 16 · Logging, monitoreo, detección y respuesta

## Amenazas
- Falta de logs, logs sin contexto, logs manipulables o borrables, logs con secretos/PII.
- Ausencia de alertas; detección tardía (meses).
- Pérdida de evidencia forense; relojes desincronizados.
- Inyección en logs (log forging); Log4Shell-style.

## Controles
- **Qué registrar**: autenticación (éxitos y fallos, MFA), cambios de privilegios/roles, accesos denegados (403/401 repetidos), acceso a datos sensibles, acciones administrativas, errores de validación, cambios de configuración, exportaciones masivas, creación/rotación de secretos, eventos de negocio críticos (pagos, reembolsos).
- **Formato**: estructurado (JSON), con *correlation/request IDs*, usuario/tenant, IP, user-agent, recurso, resultado; **UTC** y sincronización NTP.
- **Qué NO registrar**: contraseñas, tokens, claves, números completos de tarjeta, datos de salud, PII innecesaria; enmascarar/hashear cuando se requiera correlación.
- **Protección**: centralización en SIEM/stack de logs, transporte seguro, **inmutabilidad (WORM)**, control de acceso a logs, retención acorde a normativa y a investigación (p. ej. 12 meses con 3 meses "calientes"), separación de duties.
- **Detección**: alertas accionables y priorizadas (fuerza bruta, impossible travel, picos de 4xx/5xx, acceso a endpoints sensibles, escaneos, exfiltración, cambios IAM), detección de anomalías, *honeytokens/canary tokens*, integración con EDR/XDR, WAF, RASP.
- **Threat intelligence**: monitoreo de credenciales filtradas, dominios similares (phishing), CVEs en el stack (KEV).
- **Respuesta a incidentes (IR)**: roles, canales (on-call), severidades, playbooks (cuenta comprometida, fuga de secreto, ransomware, DDoS, brecha de datos), runbooks de contención, preservación de evidencia, comunicación a clientes/reguladores en plazo, post-mortem sin culpables, acciones correctivas con dueño.
- **Ejercicios**: tabletop y simulacros periódicos; pruebas de restauración de backups.
- **Auditoría**: trail de acciones de administradores y de soporte (acceso a datos de clientes con justificación).

## Fases de IR (resumen)
1. Preparación → 2. Detección y análisis → 3. Contención (aislar, revocar credenciales, bloquear IOC) → 4. Erradicación (eliminar persistencia, parchear) → 5. Recuperación (restaurar, monitoreo reforzado) → 6. Lecciones aprendidas y notificaciones (ver 20).

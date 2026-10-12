# 07 · Detección y Purple Team

Controles: `../../app-security/references/16-logging-monitoreo-incidentes.md`. Objetivo: que cada ejercicio mejore la **detección y respuesta**, no solo el código.

## Bucle purple team
1. **Elegir técnica** (cadena o eslabón) a validar.
2. **Ejecutar** la prueba en entorno autorizado con identificadores únicos (cuenta, IP, user-agent de prueba, correlation ID).
3. **Consultar** logs/SIEM/alertas: ¿se registró? ¿se alertó? ¿en cuánto tiempo? ¿con qué severidad y contexto?
4. **Clasificar**: Detectado y alertado / Registrado sin alerta / No registrado.
5. **Corregir**: añadir log faltante, regla/alerta, runbook.
6. **Repetir** para verificar y dejar un test de regresión de detección.

## Tabla de seguimiento
| Técnica / eslabón | Log esperado | ¿Registró? | ¿Alertó? | TTD | Acción | Estado |
|---|---|---|---|---|---|---|
| IDOR masivo | Accesos a múltiples IDs por token | | | | Regla de velocidad de objetos únicos | |
| Spray de contraseñas | Fallos de login por IP/ASN/cuenta | | | | | |
| SSRF a metadatos | Egress a 169.254.169.254 | | | | | |
| Cambio de rol admin | Evento de privilegios | | | | | |
| Uso de secreto desde IP nueva | Auditoría del gestor/proveedor | | | | | |
| Exportación masiva | Eventos de export con volumen | | | | | |

## Detecciones recomendadas (ideas)
- **Identidad**: fallos de login por cuenta/IP/ASN, *impossible travel*, nuevo dispositivo + cambio de credenciales/pago, picos de recuperación de cuenta, fatiga de MFA (muchos pushes).
- **Autorización**: 403/401 repetidos, acceso a muchos IDs de objetos distintos por sesión, uso de funciones admin por roles bajos, cambios en campos protegidos.
- **Datos**: exportaciones/descargas masivas, consultas anómalas, acceso fuera de horario por soporte, lecturas de tablas sensibles.
- **Red/app**: requests salientes a rangos internos o metadatos, tráfico a versiones deprecadas, user-agents de herramientas de escaneo, picos de 4xx/5xx, rutas inexistentes sensibles (`/.env`, `/.git`, `/actuator`).
- **Cloud**: creación de usuarios/claves/roles, cambios en políticas, desactivación de logs, uso de credenciales desde IP/ASN nuevo, creación de recursos en regiones no usadas, picos de costo.
- **CI/CD**: cambios en workflows, runs desde forks con secretos, nuevas acciones/dependencias, publicación de artefactos sin firma.
- **IA**: tool calls tras ingerir contenido externo, salidas con URLs a dominios no aprobados, consumo anómalo de tokens, intentos de extraer el prompt.
- **Honeytokens/canarios**: credenciales y archivos señuelo con alertas al acceso; registros señuelo en BD.

## Métricas
- **TTD** (tiempo de detección) y **TTR** (respuesta/contención) por técnica.
- % de técnicas ejercitadas con detección efectiva.
- Falsos positivos por regla; tiempo promedio de triage.
- Cobertura ATT&CK/ATLAS de las pruebas.

## Informe de detección (anexo del informe de cadena)
Por cada eslabón: evento observable, fuente de log, regla propuesta (pseudocódigo/consulta), umbral, severidad, runbook y dueño.

## Ejemplo de regla (pseudocódigo)
```
SI en 5 min el token T accede a >50 objetos únicos de tipo "invoice" cuyo owner != T.user
ENTONCES alerta severidad ALTA + invalidar sesión + notificar a seguridad
```

# 04 · Lógica de negocio y fraude (enfoque de pruebas)

Controles: `../../app-security/references/11-logica-negocio-abuso.md`. Aquí: **cómo abusar legítimamente lo que el sistema ofrece**, en entorno autorizado.

## Método: "abuse cases" por historia de usuario
Para cada flujo de valor (alta, compra, pago, retiro, reembolso, invitación, referido, cupón, trial, publicación), preguntar:
1. ¿Qué pasa si lo hago **fuera de orden**, **repetido**, **en paralelo**, **a medias**?
2. ¿Qué pasa con valores **extremos**: 0, negativos, decimales, enormes, vacíos, `NaN`, tipos distintos, arrays, Unicode?
3. ¿Qué valida el servidor y qué **confía del cliente**? (precio, moneda, cantidad, estado, destinatario, descuento)
4. ¿Cuánto **cuesta al negocio** cada acción automatizada? (SMS, email, cómputo, IA, envío)
5. ¿Qué incentivo económico tiene un atacante en este flujo?

## Matriz de pruebas
| Flujo | Pruebas |
|---|---|
| Precios/carrito | Modificar precio/moneda/descuento/envío en request; cantidades negativas o fraccionarias; combinar cupones; redondeos acumulados; overflow; cambiar producto tras fijar precio |
| Pagos | Saltar el paso de pago (acceder al callback de éxito), reusar/replay de confirmaciones, modificar monto entre autorización y captura, firmas de webhook ausentes, doble envío, estados inconsistentes con el PSP |
| Saldos/retiros | Race conditions (requests paralelos), límites diarios eludibles dividiendo operaciones, cambio de cuenta destino sin step-up, reversos |
| Cupones/promos/referidos | Reutilización, generación de cuentas falsas, auto-referidos, canje concurrente, enumeración de códigos, códigos de otros tenants |
| Trials/cuotas | Reinicio con nuevo email/dispositivo, límites por cuenta y no por persona, compartir licencias |
| Inventario/stock | Reservas sin expiración (vaciar stock), compras concurrentes que exceden stock |
| Invitaciones/envíos | Enviar emails/SMS a terceros sin límite (abuso como relay/spam), enumeración de usuarios, SMS pumping |
| Contenido/IA | Generación masiva de contenido costoso, prompts que consumen tokens, uso como proxy gratuito |
| Reportes/exportaciones | Exportar datos masivos, filtros que saltan permisos, enlaces compartidos sin expiración |
| Procesos de aprobación | Aprobarse a uno mismo, cadenas de aprobación saltables, cambio de datos tras aprobar |
| Soporte/admin | Impersonación sin auditoría, reset de MFA por ingeniería social, acciones masivas sin límites |

## Concurrencia (race conditions)
- Probar operaciones **de un solo uso o con límite** enviando N requests simultáneos (en entorno de pruebas con datos propios).
- Indicadores de vulnerabilidad: más de un éxito, saldos negativos, stock negativo, duplicados.
- Variantes: *limit-overrun*, *TOCTOU* entre verificación y uso, creación duplicada, "partial construction" (objeto accesible antes de estar completo).

## Automatización y abuso a escala (solo medición, sin ejecutar ataque real)
- Evaluar controles anti-bot: rate limit por acción, CAPTCHAs, device fingerprinting, reputación de IP, detección de comportamiento.
- Estimar economía del ataque: ganancia potencial vs costo por intento. Si la relación es favorable al atacante, es un riesgo aunque el control "exista".
- Medir sin generar impacto: usar volúmenes mínimos para comprobar si existen límites.

## Fraude y cuentas
- Creación de cuentas masivas (verificación débil), takeover (credential stuffing se evalúa por existencia de controles, **no** con listas reales), cambio de datos de contacto/pago, *card testing* (pequeñas transacciones), *chargeback abuse*.
- Señales de riesgo disponibles: velocidad, geolocalización, dispositivo, historial, reputación de email/teléfono.

## Evidencia mínima y seguridad de la prueba
- Datos y cuentas de prueba propios; importes simbólicos en sandbox del PSP.
- Evitar efectos reales (envío de correos/SMS a terceros, cobros reales, movimientos de dinero).

## Remediación (puntero)
Máquinas de estado en servidor, cálculo en backend, transacciones atómicas y restricciones únicas, límites de negocio, doble control, scoring de fraude, tests de abuso automatizados (→ app-security/11).

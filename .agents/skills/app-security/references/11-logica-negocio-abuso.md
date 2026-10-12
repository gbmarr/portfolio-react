# 11 · Lógica de negocio y abuso

## Amenazas
- Manipulación de precios, cantidades (negativas, decimales, overflow), descuentos, moneda, tasas de cambio.
- Abuso de flujos: saltar pasos, reordenar pasos, reutilizar cupones/tokens/links de invitación, referidos falsos, trial infinito.
- **Race conditions** en saldos, stock, cupones, votos, límites.
- Fraude: carding, account takeover, cuentas falsas/sybil, *chargebacks*, lavado, reembolsos abusivos.
- Scraping, scalping, spam, enumeración masiva, spam de formularios.
- Abuso de funciones legítimas: SMS pumping/toll fraud, envío de emails/invitaciones a terceros, generación de contenido costoso, uso de la plataforma como relay.
- Integer overflow/underflow y errores de redondeo en montos.
- Confianza en estado del cliente (precios en hidden fields, estado de pedido, flags).
- Exposición de información de negocio en respuestas (márgenes, stock exacto, costos).

## Controles
- **Máquinas de estado** validadas en servidor (transiciones permitidas, precondiciones).
- Cálculos críticos **solo en backend**, con enteros/decimales; precios y totales recalculados desde datos del servidor.
- **Límites de negocio**: velocidad, montos, frecuencia, cantidad por usuario/dispositivo/IP/tarjeta; cuotas diarias; límites de invitaciones/emails/SMS con verificación (CAPTCHA, cooldown, allowlist de países).
- **Doble control (4-eyes)** y aprobaciones para operaciones críticas; retenciones y *step-up auth*.
- **Detección de fraude/anomalías**: scoring de riesgo, device fingerprinting, reputación de IP/email/teléfono, velocity checks, reglas y ML.
- **Anti-automatización**: WAF con bot management, rate limits por acción de negocio, desafíos progresivos, honeypots.
- **Idempotencia** y restricciones únicas (un cupón por usuario, un voto por usuario) a nivel de base de datos.
- **Transacciones atómicas** y bloqueos para operaciones con saldos/stock.
- **Abuse cases / misuse cases** en el diseño: por cada user story, pensar "¿cómo la abusaría un atacante?"; tests automatizados de abuso.
- Auditoría de operaciones de negocio sensibles (quién, qué, cuándo, desde dónde) y alertas.
- Alertas de costos/uso anómalo (denial of wallet).

## Preguntas de revisión
- ¿Qué pasa con cantidad = 0, negativa, 1e9, NaN, string, array?
- ¿Se puede llamar al paso 3 sin haber hecho el paso 2? ¿Y repetir el paso 3 dos veces en paralelo?
- ¿Se puede aplicar el mismo cupón/reembolso varias veces o desde múltiples cuentas?
- ¿Qué cuesta (dinero, SMS, cómputo) a la empresa cada request anónimo?

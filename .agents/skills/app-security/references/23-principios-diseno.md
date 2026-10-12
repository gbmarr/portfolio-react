# 23 · Principios de diseño seguro (transversales)

| Principio | Qué significa en la práctica |
|---|---|
| **Defensa en profundidad** | Múltiples capas independientes; el fallo de una no compromete todo |
| **Mínimo privilegio / need-to-know** | Cada usuario, servicio, token y proceso con solo lo imprescindible y por el tiempo mínimo |
| **Secure by default / by design** | La configuración inicial es la segura; la seguridad se diseña, no se agrega después |
| **Fail securely (fail-closed)** | Ante error o incertidumbre, denegar |
| **Mediación completa** | Verificar cada acceso, cada vez, en el servidor |
| **Economía de mecanismo** | Diseños simples son más fáciles de verificar; evitar complejidad accidental |
| **Separación de funciones/privilegios** | Operaciones críticas requieren más de una parte o rol |
| **Zero Trust** | "Nunca confiar, siempre verificar": identidad, dispositivo y contexto en cada petición; sin confianza implícita por red interna |
| **Minimizar superficie de ataque** | Menos endpoints, puertos, dependencias, permisos, datos, funcionalidades |
| **Open design (Kerckhoffs)** | La seguridad no depende del secreto del diseño, solo de las claves |
| **Aceptabilidad psicológica** | Los controles deben ser usables; si son molestos, se evaden |
| **Seguridad testeable y observable** | Cada control tiene tests y genera señales (logs/métricas) |
| **Aislamiento y compartimentación** | Contener el radio de impacto (segmentación, cuentas separadas, sandboxes, bulkheads) |
| **Trabajo mínimo de confianza** | Reducir lo que se debe confiar (TCB pequeño); no confiar en entradas, clientes, redes ni terceros |
| **Privacy by design** | Minimizar y proteger datos personales desde el diseño |
| **Auditabilidad y no repudio** | Acciones críticas trazables a una identidad con evidencia íntegra |
| **Resiliencia y recuperación** | Asumir que habrá fallos y brechas: detectar, contener, recuperar |

## Heurística de revisión de arquitectura
1. Dibujar límites de confianza y flujos de datos.
2. Para cada cruce de límite: ¿quién es? (authN), ¿qué puede hacer? (authZ), ¿qué datos entran/salen? (validación/encoding), ¿qué se registra? (logging).
3. Para cada almacén: ¿cifrado, acceso, retención, backup?
4. Para cada dependencia externa: ¿qué pasa si falla, miente o es comprometida?
5. Para cada secreto: ¿dónde vive, quién lo lee, cómo rota?

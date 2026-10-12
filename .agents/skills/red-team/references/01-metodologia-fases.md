# 01 · Metodología y fases

Marcos de referencia: OWASP WSTG, PTES, NIST SP 800-115, MITRE ATT&CK/ATLAS (IA), CAPEC, OWASP ASVS (criterio de verificación), TIBER/CBEST (financiero).

## Perfiles de atacante
| Perfil | Capacidades típicas | Pregunta clave |
|---|---|---|
| Anónimo en internet | Superficie pública, automatización, credenciales filtradas | ¿Qué se logra sin cuenta? |
| Usuario registrado malicioso | Cuenta propia, uso normal de API/UI, tampering | ¿Puede ver/modificar lo de otros o escalar? |
| Usuario de otro tenant | Igual que anterior, en un tenant vecino | ¿Hay fuga entre tenants? |
| Usuario con rol bajo | Acceso a funciones limitadas | ¿Llega a funciones de admin (BFLA)? |
| Insider / soporte | Acceso legítimo parcial | ¿Cuánto daño con permisos legítimos? ¿Se audita? |
| Proveedor/dependencia comprometida | Código o integración de terceros | ¿Qué ve y qué puede hacer? |
| Atacante con foothold (CI/CD, laptop dev, token filtrado) | Credenciales de un eslabón interno | ¿Hasta dónde llega por movimiento lateral? |
| Bot/fraudster económico | Automatización a escala, cuentas falsas | ¿Cuánto cuesta/gana por request? |

## Fase 1 · Objetivos ("coronas")
Listar 3-7 objetivos de alto valor y el peor impacto de cada uno: transferir fondos, leer datos de otros, tomar cuentas admin, publicar contenido, ejecutar código en prod, detener el servicio, obtener claves de firma.

## Fase 2 · Reconocimiento de superficie (en alcance)
- Inventario: dominios/subdominios, endpoints (OpenAPI, JS bundles, tráfico de la app), versiones (`/v1`, `/v2`, `/beta`), puertos y paneles, buckets, repos y paquetes públicos, documentación pública, apps móviles.
- Señales: tecnologías y versiones, mensajes de error, rutas de debug, comentarios, mapas de código (`.map`), secretos en frontend, dependencias con CVE conocidas.
- Salida: **mapa de superficie** con dueño y nivel de exposición.

## Fase 3 · Modelado y priorización
- Para cada corona: ¿cuáles son los 2-3 caminos más cortos? (ver `02-cadenas-de-ataque.md`).
- Priorizar por: impacto × probabilidad × (1 / costo para el atacante) × baja detectabilidad.
- Marcar "suposiciones frágiles" (ej.: "el email del IdP siempre está verificado", "la red interna es confiable").

## Fase 4 · Ejecución por dominio (checklist de enfoque)
1. **Identidad**: registro, login, MFA, recuperación, SSO, cuentas de servicio, enumeración, bypass de flujos alternativos.
2. **Autorización**: IDOR/BOLA en cada identificador (path, query, body, headers, GraphQL, archivos), BFLA, mass assignment, multi-tenant, versiones viejas.
3. **Sesión/tokens**: expiración, revocación, reuso, claims manipulables, confusión de audiencias.
4. **Lógica de negocio**: estados, orden, repetición, concurrencia, límites, redondeos, negativos.
5. **Entradas/sumideros**: inyecciones, SSRF, uploads, deserialización, plantillas, parsers.
6. **Cliente**: XSS, CSRF, CORS, `postMessage`, almacenamiento, terceros.
7. **Infra/cloud/CI-CD**: IAM, metadatos, buckets, secretos, runners, permisos de pipeline.
8. **IA/agentes**: inyección de prompts, abuso de herramientas, fuga entre contextos.
9. **Disponibilidad y costos**: amplificación, consultas costosas, límites ausentes (probar en entorno aislado y con límites).
10. **Observabilidad**: ¿cada acción anterior dejó rastro y disparó alertas?

## Fase 5 · Encadenamiento y demostración
- Combinar eslabones. Documentar **precondiciones**, **pasos** y **resultado**.
- Evidencia mínima: un request/respuesta enmascarado, un identificador propio, un canario. Detenerse al probar el impacto (no escalar más de lo necesario ni extraer datos reales).

## Fase 6 · Reporte y cierre
- Informe de cadena (`assets/informe-cadena-ataque.md`) + remediación + detección + regresión.
- Priorizar el **eslabón más barato de cerrar que rompe más cadenas** (choke point).
- Retest y verificación; actualizar el modelo de amenazas.

## Reglas operativas
- Cuentas de prueba dedicadas (≥2 por rol y ≥2 tenants) para probar autorización cruzada.
- Registrar todo (hora, IP de origen, request) para correlación con el equipo defensivo.
- Rate limiting propio de las pruebas; evitar impacto a usuarios reales.
- Detener y avisar ante: datos reales expuestos, riesgo de caída, hallazgo crítico (notificar de inmediato, no esperar al informe).

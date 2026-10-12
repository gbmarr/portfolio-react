---
name: red-team
description: Evaluación ofensiva AUTORIZADA de aplicaciones y sistemas propios desde la óptica del atacante - planificación de pruebas, modelado adversarial, cadenas de ataque (attack chains), pentest de apps/APIs/cloud/CI-CD/agentes de IA, abuso de lógica de negocio y fraude, purple teaming y reportes con impacto de negocio. Usar cuando el usuario pida "cómo atacarías esto", "armá un plan de pentest", "red team", "threat hunting ofensivo", "simulá un atacante", "encadená vulnerabilidades", "qué es lo peor que podría pasar", "pre-release security test", "adversarial review", "bug bounty", "pentest de mi API", o quiera validar si los controles realmente resisten. Complementa a app-security (que aporta el catálogo de controles y el formato de hallazgos); no reemplaza su uso defensivo durante el desarrollo.
---

# Red Team (evaluación adversarial autorizada)

Actuás como **operador de Red Team / pentester** que trabaja *para el dueño del sistema*. Tu objetivo es descubrir cómo se comprometería realmente el sistema, demostrar el impacto con la mínima evidencia necesaria y devolver correcciones y detecciones que cierren el ciclo.

Esta skill depende de **`app-security`** para el catálogo de vulnerabilidades y controles (`../app-security/references/`). Aquí solo se aporta metodología ofensiva: *cómo pensar, qué encadenar, cómo probar y cómo reportar*.

## 0. Autorización y alcance (obligatorio antes de cualquier prueba)

Antes de proponer o ejecutar pruebas activas, confirmá o asumí explícitamente (y registrá en el plan):

1. **Propiedad/autorización**: el sistema es del usuario o existe autorización escrita (rules of engagement). Si no está claro y la tarea es probar un sistema ajeno o activo en producción, **frená y pedilo**.
2. **Alcance**: dominios, IPs, repos, entornos, cuentas de prueba, qué queda fuera (terceros, proveedores cloud, datos de clientes reales).
3. **Entorno**: preferir **staging/entorno aislado** con datos sintéticos. En producción: solo pruebas de bajo impacto, con ventana acordada y contacto de emergencia.
4. **Reglas de contención**: sin DoS real, sin destrucción/alteración de datos, sin exfiltración de datos reales (demostrar con registros propios/canarios), sin ingeniería social contra personas salvo alcance explícito.
5. **Manejo de evidencia**: capturas mínimas, datos enmascarados, secretos encontrados se reportan y se rotan; no se reutilizan.

Si el usuario solo pide ideas o análisis (modo "sobre el papel"), no hace falta ejecutar nada: hacé el análisis de rutas de ataque y el plan de pruebas.

## 1. Límites de contenido (siempre)

- ✅ Hipótesis de ataque, rutas encadenadas, planes de prueba, PoC **mínimas** para demostrar un hallazgo en un sistema autorizado (un request, un payload inocuo tipo `alert(document.domain)`, un test con IDs propios), reglas de detección y remediación.
- ✅ Scripts de automatización de pruebas defensivas (fuzzing de propios endpoints, tests de autorización, verificación de configuración).
- ❌ Malware, ransomware, stealers, keyloggers, rootkits, botnets, C2 operativo, evasión de EDR/AV, ofuscación para evadir detección.
- ❌ Exploits armados/weaponizados contra software de terceros o infraestructura ajena; campañas de phishing reales; credential stuffing con listas reales; scraping masivo de datos personales.
- ❌ Ayudar a atacar sistemas sobre los que el usuario no demuestra autorización cuando el contexto sugiere lo contrario.
- Ante una solicitud ambigua: aplicá la lectura defensiva (qué probar, cómo detectarlo, cómo corregirlo) y no profundices en explotación operativa.

## 2. Modos de trabajo

| Modo | Entrada | Salida |
|---|---|---|
| **Paper red team** | Arquitectura/descripción/código | Rutas de ataque priorizadas, "peor caso", supuestos y plan de pruebas |
| **Plan de pruebas** | Alcance + stack | `assets/plan-de-pruebas.md` completado |
| **Revisión adversarial de código** | Código/PR | Hallazgos + cadenas que combinan fallas menores, con fix |
| **Ejecución guiada** (con autorización y herramientas) | Entorno de pruebas | Pruebas por fases con evidencia mínima y reporte |
| **Purple team** | Hallazgos + logs/alertas | Qué detectó/no detectó el monitoreo, reglas nuevas, tests de regresión |
| **Pre-release gate** | Release candidate | Checklist adversarial rápida + decisión go/no-go con riesgos |

## 3. Metodología (fases)

Detalle en `references/01-metodologia-fases.md`.

1. **Objetivos y "coronas"**: ¿qué le importa al negocio proteger? (dinero, datos de clientes, cuentas admin, reputación, continuidad). Todo el análisis parte de ahí.
2. **Reconocimiento de superficie**: endpoints, subdominios, APIs, versiones, JS bundles, repos públicos, paneles, integraciones, secretos expuestos, tecnologías.
3. **Modelado adversarial**: perfiles de atacante (anónimo, usuario registrado malicioso, usuario de otro tenant, insider, proveedor comprometido, atacante con foothold en CI/CD).
4. **Hipótesis y priorización**: rutas más cortas hacia las coronas; combinaciones de fallas de bajo impacto.
5. **Prueba por dominio**: authN/authZ, lógica de negocio, inyecciones, cliente, red, cloud, CI/CD, IA.
6. **Encadenamiento y demostración de impacto** con la mínima evidencia.
7. **Reporte, detección y remediación**: informe de cadena de ataque, reglas de detección, tests de regresión.
8. **Retest** tras correcciones.

## 4. Ruteo de referencias

| Si la tarea toca... | Leer |
|---|---|
| Metodología, fases, perfiles de atacante, priorización | `references/01-metodologia-fases.md` |
| Combinar fallas, "peor escenario", rutas de compromiso | `references/02-cadenas-de-ataque.md` |
| Login, sesiones, JWT, roles, tenants, IDOR, SSO | `references/03-authn-authz-abuso.md` + `../app-security/references/02,03,04,19` |
| Pagos, cupones, saldos, flujos, fraude, bots | `references/04-logica-negocio-fraude.md` + `../app-security/references/11` |
| Cloud, CI/CD, dependencias, contenedores, secretos | `references/05-cloud-cicd-supplychain.md` + `../app-security/references/10,12,13,14` |
| LLMs, agentes, RAG, MCP | `references/06-ia-agentes.md` + `../app-security/references/21` |
| Qué debería haberse detectado, alertas, purple team | `references/07-deteccion-y-purple-team.md` + `../app-security/references/16` |
| Inyecciones, XSS, SSRF, uploads, APIs, cripto | Catálogo de `../app-security/references/05-09` (qué buscar); aquí solo cómo encadenarlo |

Si `app-security` no está instalada, aplicá igualmente esta skill con los conocimientos generales de OWASP/ASVS y avisá que faltan las referencias.

## 5. Principios del atacante (checklist mental)

1. **Seguí el dinero y los datos**: pagos, PII, credenciales, claves, tokens, backups.
2. **Seguí la confianza**: ¿qué asume el sistema sin verificar? (cliente, red interna, header, otro servicio, un modelo de IA).
3. **Cambiá identidad/objeto/tenant/orden/cantidad/tiempo** en cada request relevante.
4. **Lo menos defendido es lo olvidado**: versiones viejas de API, endpoints internos, exports, jobs, webhooks, soporte/admin, staging, móviles, integraciones.
5. **Encadená**: una fuga de información + un IDOR + un token mal acotado suele superar a cualquier falla aislada.
6. **El camino más corto gana**: credenciales filtradas, CI/CD, secretos, SSRF a metadatos o recuperación de cuenta suelen ser más fáciles que un 0-day.
7. **Medí el radio de impacto** (blast radius): qué más abre la cosa que se comprometió.
8. **¿Lo habríamos visto?** Para cada ataque, anotar qué log/alerta lo detectaría; si ninguna, es un hallazgo de detección.

## 6. Severidad en cadenas

Se califica el **impacto final de la cadena**, no el eslabón individual.

- **Crítica**: compromiso de datos masivo, toma de cuentas privilegiadas, control de infraestructura, fraude financiero directo.
- **Alta**: acceso no autorizado a datos de otros usuarios/tenants, escalada a admin, abuso económico relevante.
- **Media**: requiere condiciones fuertes o impacto acotado.
- **Baja / Info**: eslabones que solo aportan información o no son explotables solos.
- Indicá siempre: *precondiciones* (qué necesita el atacante), *complejidad* y *detectabilidad*.

## 6b. Salida

- **Informe**: `assets/informe-cadena-ataque.md` para cada cadena + resumen ejecutivo, y la tabla de hallazgos individuales en el formato de `../app-security/assets/report-template.md`.
- **Plan**: `assets/plan-de-pruebas.md`.
- Cada hallazgo incluye **remediación**, **detección** (qué evento/alerta lo vería) y **test de regresión**.
- Idioma del usuario; concreto: ruta, parámetro, precondición, evidencia mínima.

## 7. Integración con app-security

Después de cada ejercicio:
1. Cada hallazgo → issue con fix + test de regresión (`app-security/references/13`).
2. Cada ataque no detectado → regla/alerta nueva (`app-security/references/16`).
3. Patrones repetidos → agregar al checklist rápido y reglas de SAST propias.
4. Riesgos aceptados → registrar dueño y fecha de revisión.

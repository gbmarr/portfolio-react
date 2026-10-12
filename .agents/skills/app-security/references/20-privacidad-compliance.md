# 20 · Privacidad y cumplimiento normativo

> Orientación técnica; no constituye asesoramiento legal. Validar requisitos con asesoría legal/compliance y con la autoridad de aplicación vigente.

## Riesgos
- Recolección excesiva, uso sin base legal, finalidad no declarada, retención indefinida.
- Transferencias internacionales sin garantías adecuadas.
- Falta de derechos del titular (acceso, rectificación, supresión, portabilidad, oposición, limitación).
- Brechas sin detección ni notificación en plazo.
- Datos de menores y datos sensibles (salud, biometría, ideología, orientación, financieros, ubicación precisa).
- Tracking, cookies y SDKs de analítica/publicidad sin consentimiento; *fingerprinting*.
- Datos personales en logs, backups, entornos de prueba, analítica, modelos de IA y herramientas de soporte.
- Terceros/encargados sin contrato ni evaluación.
- Decisiones automatizadas sin transparencia ni revisión humana.

## Controles
- ***Privacy by design/default***; **DPIA/PIA** para tratamientos de alto riesgo; **registro de tratamientos** y mapa de datos (qué, dónde, por qué, quién accede, cuánto tiempo).
- **Minimización**, seudonimización, anonimización/agregación; separación de identificadores y datos sensibles; cifrado (→ 09); control de acceso estricto y auditoría.
- **Consentimiento** granular, revocable y registrado (CMP); respetar *Do Not Track*/GPC cuando aplique; banner de cookies sin *dark patterns*.
- **Portal/proceso de derechos del titular** con plazos y verificación de identidad; exportación y borrado efectivos (incluyendo backups por rotación, y terceros).
- **Retención y borrado**: políticas por categoría, jobs automáticos, borrado seguro/crypto-shredding.
- **Terceros**: contratos con encargados (DPA), evaluación de seguridad (*third-party risk*), cláusulas para transferencias internacionales, lista de subencargados.
- **Datos de prueba**: sintéticos o enmascarados.
- **Gestión de brechas**: detección, evaluación de impacto, notificación a autoridad y afectados en los plazos legales, registro de incidentes.
- **Oficial de protección de datos (DPO)** cuando corresponda.

## Marcos y normas a considerar (según el caso)
| Marco | Aplica a |
|---|---|
| **Ley 25.326 (Argentina)**, Decreto 1558/2001 y disposiciones de la **AAIP** (registro de bases, consentimiento, transferencias internacionales, medidas de seguridad) | Datos personales de personas en Argentina |
| **GDPR** (UE/UK GDPR) | Usuarios en la UE/UK u oferta de servicios allí |
| **CCPA/CPRA** y leyes estatales de EE.UU. | Residentes de California y otros estados |
| **LGPD** (Brasil), **Ley 1581** (Colombia), **LFPDPPP** (México), **Ley 19.628/21.719** (Chile) | Usuarios en esos países |
| **HIPAA** | Información de salud en EE.UU. |
| **PCI DSS 4.0** | Datos de tarjetas de pago (minimizar alcance: tokenización, proveedores certificados, no almacenar CVV) |
| **SOC 2**, **ISO/IEC 27001/27701**, **NIST CSF/800-53** | Aseguramiento y gestión de seguridad/privacidad |
| **Normativa BCRA / CNV / UIF** (Argentina) | Entidades financieras, fintech, mercado de capitales (requisitos de seguridad, continuidad, reporte de incidentes) |
| **DORA / NIS2** | Sector financiero y entidades esenciales en la UE |
| **ISO 22301**, **ISO 27035** | Continuidad e incidentes |

## Preguntas de revisión
- ¿Para qué se usa cada dato personal y cuándo se borra?
- ¿Hay datos personales en logs, analítica, tickets de soporte o prompts a modelos de IA?
- ¿Podemos atender un pedido de acceso/supresión en el plazo legal? ¿Cuánto tardaríamos en notificar una brecha?
- ¿Qué terceros reciben datos y bajo qué contrato/país?

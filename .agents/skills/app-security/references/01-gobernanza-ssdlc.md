# 01 · Gobernanza y ciclo de vida seguro (SSDLC)

## Controles
- Requisitos de seguridad explícitos (ASVS), con nivel objetivo L1/L2/L3 según criticidad.
- Modelado de amenazas (STRIDE, PASTA; LINDDUN para privacidad) en diseño y ante cambios grandes.
- Clasificación de datos y activos (público, interno, confidencial, restringido).
- Security design reviews de arquitectura; code review con checklist de seguridad; security champions por equipo.
- Capacitación periódica en desarrollo seguro.
- Gestión de vulnerabilidades con SLAs por severidad (CVSS + EPSS + CISA KEV + contexto). Ejemplo orientativo: Crítica 24-72 h, Alta 7-15 días, Media 30-60 días, Baja próximo ciclo.
- Programa de divulgación responsable: `/.well-known/security.txt`, VDP o bug bounty.
- Pentests periódicos; Red Team según madurez.
- Plan de respuesta a incidentes probado (tabletop).
- Medición de madurez (OWASP SAMM, BSIMM) y alineación a NIST SSDF.

## Preguntas de revisión
- ¿Existe un documento de requisitos de seguridad por feature sensible?
- ¿Se hizo threat model de los flujos con datos sensibles o dinero? (usar `assets/threat-model-template.md`)
- ¿Quién es dueño de cada vulnerabilidad abierta y con qué plazo?
- ¿Hay un canal para que investigadores reporten hallazgos?
- ¿Se prueba el plan de incidentes al menos una vez al año?

## Proceso de threat modeling (resumen)
1. Alcance y diagrama de flujo de datos (actores, componentes, almacenes, límites de confianza).
2. Identificar amenazas por elemento (STRIDE: Spoofing, Tampering, Repudiation, Information disclosure, DoS, Elevation of privilege).
3. Priorizar (probabilidad × impacto).
4. Definir mitigaciones y mapearlas a requisitos/tests.
5. Registrar riesgo residual y aceptaciones con responsable.
6. Revisar ante cambios de arquitectura.

# 06 · IA y agentes (enfoque de pruebas)

Controles: `../../app-security/references/21-ia-llm.md`. Marcos útiles: OWASP Top 10 for LLM Apps, MITRE ATLAS, NIST AI RMF.

## Modelo del atacante en sistemas con LLM
- **Fuentes no confiables**: mensajes del usuario, documentos, webs, emails, tickets, resultados de herramientas, memoria, metadatos de archivos/imágenes, servidores MCP.
- **Poder del agente**: herramientas que lee/escribe/envía/ejecuta, con qué identidad y permisos.
- **Canales de salida**: respuestas (markdown/HTML/links/imágenes), llamadas a herramientas, escrituras en BD, correos.
- Riesgo = *contenido no confiable* + *acceso a datos/acciones* + *canal de salida*. La combinación de las tres es la "tríada letal".

## Plan de pruebas
| Área | Qué probar (en entorno autorizado, con datos de prueba) |
|---|---|
| Inyección directa | ¿El modelo ignora instrucciones del sistema ante peticiones adversarias? ¿Se revelan prompt del sistema o configuración? |
| Inyección indirecta | Colocar instrucciones inofensivas de prueba (p. ej. "responder con la palabra CANARIO-123") en un documento/web/email/ticket que el agente procesa; ¿las obedece? ¿Intenta usar herramientas? |
| Exfiltración | ¿Puede la salida incluir datos sensibles en URLs/imagenes markdown/links que se renderizan automáticamente hacia dominios externos? ¿Hay CSP/allowlist? |
| Abuso de herramientas | Probar si el agente puede ser inducido a llamar herramientas fuera del propósito (enviar email, leer archivos, llamar APIs, ejecutar código); verificar permisos reales y aprobación humana |
| Autorización | ¿El agente respeta los permisos del **usuario final**? Probar con dos usuarios: ¿puede el usuario A obtener datos del B mediante el agente/RAG? |
| RAG/memoria | Documentos con instrucciones de prueba; ¿se aplican controles de acceso por documento en la recuperación? Contaminación de la base; fuga entre tenants por índices compartidos |
| Output handling | Salida con `<script>`, SQL, comandos, rutas, URLs internas; ¿se renderiza/ejecuta sin validar? |
| Ejecución de código | Sandboxing (red, FS, secretos, recursos, tiempo); acceso a metadatos cloud desde el sandbox |
| Supply chain | Modelos/datasets/plugins/MCP: procedencia, permisos, versiones fijadas; herramientas que cambian su descripción tras aprobación |
| Costos/DoS | Límites de tokens/iteraciones/herramientas por usuario; bucles de agente; prompts que provocan consumo excesivo |
| Alucinación con impacto | Paquetes/URLs/comandos inventados que el agente instala o ejecuta (slopsquatting) |
| Observabilidad | ¿Se registran prompts, tool calls y decisiones para investigar? |

## Payloads de prueba seguros
Usar marcadores inocuos y verificables (canarios):
- Texto que pide devolver una cadena específica.
- Enlaces a un dominio de prueba propio para detectar exfiltración por render.
- Datos "señuelo" con identificadores únicos en documentos de otro tenant de prueba para detectar fugas.
No usar instrucciones destructivas ni datos reales.

## Criterios de hallazgo
- **Alto/Crítico**: el agente realiza acciones sensibles o filtra datos sin aprobación a partir de contenido no confiable; fuga entre usuarios/tenants.
- **Medio**: inyección exitosa sin herramientas ni datos sensibles accesibles (impacto limitado), fuga del prompt del sistema sin secretos.
- Evaluar siempre el **mínimo privilegio real** del agente, más que la "robustez" del prompt: los prompts no son un control de seguridad.

## Remediación (puntero)
Autorización en backend con identidad del usuario, mínimo privilegio por herramienta, human-in-the-loop, aislamiento de contexto, sanitización de salida, egress control, guardrails y límites, evaluación continua (→ app-security/21).

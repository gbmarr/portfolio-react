# Plan de pruebas — Red Team / Pentest interno

**Sistema:** <nombre> · **Fecha:** <AAAA-MM-DD> · **Responsable:** <nombre> · **Aprobado por:** <dueño del sistema>

## 1. Autorización y reglas de contención
- **Autorización:** <quién la otorgó, dónde consta>
- **Alcance incluido:** <dominios, repos, apps, cuentas, entornos>
- **Alcance excluido:** <terceros, proveedores, producción real de pagos, etc.>
- **Entorno:** <staging/producción con ventana acordada>
- **Ventana de ejecución:** <fecha/hora inicio-fin>
- **Reglas**: sin DoS real · sin alterar/destruir datos reales · sin exfiltrar datos reales (usar canarios) · sin ingeniería social salvo alcance explícito
- **Contacto de emergencia:** <nombre, canal, disponibilidad>
- **Cuentas de prueba:** <roles, tenants, credenciales — no reales>

## 2. Objetivos (coronas)
| # | Objetivo de negocio a proteger | Peor impacto |
|---|---|---|
| 1 | | |

## 3. Perfiles de atacante a simular
- [ ] Anónimo en internet
- [ ] Usuario registrado malicioso
- [ ] Usuario de otro tenant
- [ ] Rol bajo escalando a admin
- [ ] Insider/soporte
- [ ] Proveedor/dependencia comprometida
- [ ] Atacante con foothold en CI/CD
- [ ] Bot/fraudster económico

## 4. Superficie en alcance
| Activo | Tipo | Exposición | Notas |
|---|---|---|---|
| | API/Web/Móvil/Cloud/CI-CD | Pública/Interna | |

## 5. Plan por fase

| Fase | Dominio | Técnicas a probar | Referencia | Responsable | Estado |
|---|---|---|---|---|---|
| Reconocimiento | Superficie, secretos expuestos, versiones | | `references/01` | | |
| Identidad | Login, MFA, recuperación, SSO | | `references/03` | | |
| Autorización | IDOR/BOLA, BFLA, mass assignment, multi-tenant | | `references/03` | | |
| Lógica de negocio | Precios, cupones, pagos, race conditions | | `references/04` | | |
| Entradas/cliente | Inyecciones, XSS, CSRF, SSRF, uploads | | `../app-security/references/05-07` | | |
| APIs | Rate limit, GraphQL, webhooks | | `../app-security/references/08` | | |
| Cloud/CI-CD | IAM, secretos, pipelines, contenedores | | `references/05` | | |
| IA/Agentes | Prompt injection, abuso de herramientas | | `references/06` | | |
| Disponibilidad | Límites, costos (sin DoS real) | | `../app-security/references/17` | | |
| Detección | Purple team por técnica ejecutada | | `references/07` | | |

## 6. Cadenas priorizadas a intentar
| # | Corona objetivo | Hipótesis de cadena | Prioridad |
|---|---|---|---|
| | | | Alta/Media/Baja |

## 7. Entregables
- [ ] Informe por cadena (`informe-cadena-ataque.md`)
- [ ] Tabla de hallazgos individuales (`../app-security/assets/report-template.md`)
- [ ] Resultados de purple team (detección)
- [ ] Plan de remediación priorizado
- [ ] Fecha de retest

# 05 · Cloud, CI/CD y cadena de suministro (enfoque de pruebas)

Controles: `../../app-security/references/10, 12, 13, 14`. Aquí: **rutas de compromiso y qué verificar** en entornos propios o autorizados (idealmente con credenciales de solo lectura / auditoría).

## Perspectiva de atacante en cloud
Preguntas guía:
1. **Foothold inicial**: ¿qué da acceso inicial? (credencial filtrada, SSRF, app vulnerable, bucket público, CI/CD, laptop de dev)
2. **Credenciales alcanzables**: metadatos, variables de entorno, secretos montados, archivos de configuración, tokens de CI.
3. **Permisos efectivos**: ¿qué puede hacer ese rol/identidad? ¿Hay caminos de **escalada de privilegios** (pasar roles, modificar políticas, crear claves, ejecutar código con roles más potentes)?
4. **Movimiento lateral**: otras cuentas/proyectos/clústeres alcanzables por confianza entre cuentas, redes planas, peering.
5. **Datos/coronas**: buckets, bases de datos, backups, KMS, secretos.
6. **Persistencia y evasión del monitoreo** (solo para evaluar *detección*: ¿se notaría un nuevo usuario/clave/rol, desactivar logs, crear recursos en regiones no usadas?).

## Checklist de verificación (config/auditoría)
- **Exposición**: buckets/blobs públicos, bases de datos con IP pública, security groups `0.0.0.0/0` a SSH/RDP/DBs, paneles (Kibana, Grafana, Jenkins, K8s dashboard) sin auth, snapshots/AMIs compartidas.
- **IAM**: políticas con `*`, roles asumibles por cualquiera/cuentas externas sin condiciones, claves de acceso antiguas, root sin MFA, usuarios sin uso, permisos de escalada (`iam:PassRole`, `iam:CreatePolicyVersion`, `iam:AttachUserPolicy`, `sts:AssumeRole` abierto, equivalentes en Azure/GCP).
- **Metadatos**: IMDSv2 obligatorio, hop limit, acceso desde contenedores.
- **Secretos**: en variables de entorno de funciones/instancias, en user-data, en imágenes, en state de Terraform, en repos; permisos de lectura sobre el gestor de secretos.
- **Kubernetes**: API server expuesto, anonymous auth, RBAC con wildcards o `cluster-admin`, `automountServiceAccountToken` innecesario, pods privilegiados/`hostPath`/`hostNetwork`, sin NetworkPolicies, secrets sin cifrar, kubelet abierto, imágenes de registros no confiables.
- **Contenedores**: root, capabilities, `docker.sock`, imágenes sin escanear, secretos en capas.
- **Logging**: CloudTrail/Audit Logs activos en todas las regiones, logs en cuenta separada e inmutable, alertas sobre acciones críticas.
- **Backups**: accesibles desde la misma cuenta con credenciales de producción (riesgo ransomware), sin inmutabilidad.
- **DNS/certificados**: CNAME colgantes, subdominios huérfanos, certificados por vencer.
- **Costos**: sin alertas de presupuesto (cryptojacking pasa desapercibido).

## CI/CD y cadena de suministro — rutas de ataque
| Vector | Qué verificar |
|---|---|
| Workflows de GitHub Actions | `pull_request_target` con checkout de código de fork; interpolación de `${{ github.event.* }}` en `run:`; `permissions:` amplios; acciones por tag/rama en lugar de hash; secretos disponibles a forks; artefactos compartidos entre jobs sin verificación |
| Runners | Self-hosted compartidos o persistentes, con acceso a red interna/secretos |
| Credenciales de despliegue | Claves estáticas de larga vida; falta de OIDC; roles de despliegue con permisos de admin |
| Ramas y revisión | Protecciones ausentes, reviewers que pueden aprobar su propio código, bypass para admins |
| Dependencias | Typosquatting/dependency confusion (nombres internos sin namespace reservado), scripts `postinstall`, versiones sin lockfile/hash, repos de artefactos sin control |
| Imágenes | Tags mutables (`latest`), bases no verificadas, registries públicos sin pin por digest |
| Artefactos | Sin firma ni procedencia; admisión en K8s que acepta cualquier imagen |
| Terceros en front-end | Scripts externos sin SRI, tag managers con acceso amplio |
| Herramientas de desarrollo | Extensiones de IDE/IA, servidores MCP o plugins con permisos amplios, tokens personales con scope total |

## Evaluación de "blast radius"
Para cada identidad/secreto/pipeline: ¿qué pasa si se compromete? Documentar alcance (cuentas, datos, entornos) y tiempo de detección esperado.

## Métodos seguros de prueba
- Preferir **auditoría de configuración** y análisis de permisos (read-only) antes que pruebas activas.
- En CI/CD: usar repos/forks de prueba o ramas controladas; no publicar paquetes maliciosos ni comprometer registros reales.
- Para dependency confusion: verificar existencia/reserva de nombres internos (sin publicar paquetes en registros públicos con código malicioso).
- Secretos descubiertos: reportar, **no usar** más allá de comprobar vigencia con el dueño y rotar.

## Remediación (puntero)
Mínimo privilegio y credenciales efímeras, IMDSv2, segmentación, políticas como código, pins por hash, firmas/SLSA, admisión, logging inmutable, backups aislados (→ app-security/10, 12, 14).

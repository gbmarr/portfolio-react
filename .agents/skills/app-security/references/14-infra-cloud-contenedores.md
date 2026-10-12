# 14 · Infraestructura, nube, contenedores y orquestación

## Amenazas
- Buckets/blobs públicos, bases de datos y paneles expuestos a internet, puertos innecesarios abiertos, SSH/RDP abiertos al mundo.
- IAM excesivo (`*:*`), claves de larga vida, root sin MFA, roles asumibles por cualquiera, *privilege escalation* vía IAM.
- Metadatos cloud accesibles (SSRF → credenciales).
- Contenedores privilegiados, imágenes sin parchear, ejecución como root, *escape* de contenedor, socket Docker montado.
- Kubernetes: API server expuesto, RBAC laxo (`cluster-admin`), secrets sin cifrar, sin NetworkPolicies, `hostPath`/`hostNetwork`, kubelet abierto, dashboards sin auth.
- Drift de configuración, IaC con errores, state de Terraform con secretos expuesto.
- SO sin parches; servicios innecesarios activos.
- Persistencia y movimiento lateral; cryptojacking.
- Subdomain takeover; DNS comprometido; certificados expirados.
- Ransomware sobre backups accesibles.

## Controles
- **Hardening** según CIS Benchmarks; parcheo regular y automatizado; imágenes/AMIs doradas.
- **IAM**: mínimo privilegio, MFA (especialmente root/admin), roles temporales, SCPs/Organization Policies, separación por cuentas/proyectos (prod/stage/dev), sin usuarios IAM con claves estáticas cuando sea evitable, revisión con Access Analyzer/CIEM.
- **Red**: VPC con subnets privadas, security groups mínimos, bases de datos sin IP pública, bastion/SSM/IAP en vez de SSH abierto, *zero trust*, WAF y protección DDoS, egress filtering, endpoints privados a servicios cloud.
- **Almacenamiento**: *block public access* por defecto, cifrado, versionado, logging de acceso, políticas de bucket estrictas.
- **Contenedores**: imágenes mínimas (distroless), usuario no root (`USER 10001`), `readOnlyRootFilesystem`, `allowPrivilegeEscalation: false`, `drop: [ALL]` capabilities, seccomp `RuntimeDefault`/AppArmor, sin `--privileged`, sin montar `docker.sock`, límites de CPU/memoria, escaneo y firma, `HEALTHCHECK`, sin secretos en capas.
- **Kubernetes**: Pod Security Standards (restricted), RBAC mínimo y sin wildcards, NetworkPolicies default-deny, secretos cifrados con KMS provider y/o external-secrets, admission controllers (Kyverno/OPA Gatekeeper), API server privado/autenticado, kubelet con auth, service accounts dedicados con `automountServiceAccountToken: false` cuando no se necesita, *runtime security* (Falco/Tetragon), separación por namespaces.
- **IaC** versionado, revisado y con *policy-as-code*; detección de drift; state remoto cifrado y con acceso restringido.
- **CSPM/CIEM** e inventario continuo de activos; **EASM** (gestión de superficie de ataque externa) y monitoreo de DNS/certificados.
- **Backups** aislados (cuenta separada), inmutables (object lock), cifrados y con pruebas de restauración; RTO/RPO definidos.
- Logs de plano de control habilitados (CloudTrail, Activity Log, Audit Logs) y alertas sobre acciones críticas.
- Presupuestos y alertas de costo (detecta cryptojacking y abuso).

## Ejemplo Dockerfile endurecido
```dockerfile
FROM gcr.io/distroless/nodejs20-debian12@sha256:<digest>
WORKDIR /app
COPY --chown=10001:10001 --from=build /app/dist ./dist
USER 10001
CMD ["dist/server.js"]
```

## Ejemplo securityContext (Kubernetes)
```yaml
securityContext:
  runAsNonRoot: true
  runAsUser: 10001
  allowPrivilegeEscalation: false
  readOnlyRootFilesystem: true
  capabilities: { drop: ["ALL"] }
  seccompProfile: { type: RuntimeDefault }
```

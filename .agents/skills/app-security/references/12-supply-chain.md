# 12 · Cadena de suministro de software

## Amenazas
- Dependencias vulnerables (CVE), abandonadas o maliciosas.
- Typosquatting, dependency confusion, *protestware*, mantenedores comprometidos, takeover de paquetes/dominios de mantenedores.
- Scripts de instalación maliciosos (`postinstall`, `setup.py`).
- Imágenes base comprometidas o desactualizadas; tags mutables (`latest`).
- Compromiso del pipeline CI/CD: *build poisoning*, GitHub Actions/plugins inseguros, `pull_request_target` mal usado, inyección en workflows, runners compartidos, secretos expuestos a forks.
- Artefactos sin firma ni procedencia; repositorios de artefactos sin control.
- Componentes de terceros embebidos (SDKs, CDNs, tag managers).
- Licencias incompatibles.

## Controles
- **SCA continuo** (Dependabot, Renovate, Snyk, OSV-Scanner, Trivy, `npm audit`, `pip-audit`, `cargo audit`), con SLAs y priorización por explotabilidad (EPSS/KEV) y alcanzabilidad.
- **SBOM** (CycloneDX/SPDX) generado en cada build y **VEX** para estados de explotabilidad.
- **Lockfiles** versionados y obligatorios (`npm ci`, `pip --require-hashes`, `poetry.lock`, `go.sum`); versiones fijadas; registry interno/proxy; *namespaces/scopes* reservados contra dependency confusion; `--ignore-scripts` cuando sea posible.
- **Firma de artefactos e imágenes** (Sigstore/cosign), atestaciones de procedencia, **SLSA** (nivel objetivo), builds reproducibles y herméticos.
- **Revisión de dependencias nuevas**: mantenimiento, popularidad, permisos, OpenSSF Scorecard, licencia; preferir pocas dependencias y bien mantenidas.
- **Pipelines seguros**: mínimo privilegio en tokens (`permissions:` explícito), acciones/plugins **fijados por hash de commit**, ramas protegidas, revisión obligatoria, commits firmados, entornos protegidos con aprobación, runners efímeros, sin secretos para forks, OIDC en vez de claves estáticas.
- **Políticas de admisión** (Kyverno/OPA/Sigstore policy-controller) que solo permitan imágenes firmadas desde registros confiables; pin por digest (`image@sha256:`).
- Imágenes base mínimas y actualizadas (distroless/alpine/chainguard), escaneo continuo.
- Inventario de SDKs/tags de terceros en front-end; SRI y CSP (→ 06).
- Políticas de licencias y escaneo de licencias.
- Plan de respuesta ante dependencia comprometida (identificar uso vía SBOM, rotar secretos, rebuild).

## Anti-patrones
- `FROM node:latest`, `pip install` sin versión/hash, `curl | bash` en Dockerfile/CI.
- `uses: org/action@main`; `on: pull_request_target` que hace checkout del PR; `${{ github.event.* }}` interpolado en `run:`.
- Lockfile ignorado en `.gitignore`.

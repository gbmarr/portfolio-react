# 10 · Gestión de secretos

## Amenazas
- Secretos en repositorios (incluido historial git), imágenes Docker, variables de entorno expuestas (`/proc`, debug pages, `docker inspect`), logs, tickets, chats, front-end/bundles, apps móviles.
- Tokens de larga duración y con permisos excesivos; credenciales compartidas entre personas/servicios/entornos.
- Secretos en artefactos de CI, caché, logs de pipeline, o expuestos a PRs de forks.

## Controles
- **Gestor de secretos** (HashiCorp Vault, AWS Secrets Manager/SSM, Azure Key Vault, GCP Secret Manager, Doppler, 1Password Secrets) con control de acceso y auditoría.
- **Credenciales efímeras y federación de identidad** (OIDC para CI/CD, IAM roles, Workload Identity, IRSA, managed identities) en vez de claves estáticas.
- **Secret scanning** en pre-commit, CI y repositorios (gitleaks, trufflehog, GitHub Secret Scanning con push protection); **rotación inmediata** ante fuga (reescribir el historial no basta).
- Secretos separados por entorno y por servicio, con mínimo privilegio y expiración.
- No pasar secretos por argumentos de línea de comandos ni `ARG` de Docker; usar `--secret` de BuildKit o montaje en runtime.
- `.env` en `.gitignore`; `.env.example` solo con placeholders.
- Enmascarado de secretos en logs de CI; evitar `echo` de variables.
- Auditar y alertar accesos anómalos a secretos; inventario con dueño y fecha de rotación.
- En front-end/móvil: **ningún secreto real** en el cliente; usar backend proxy o tokens de corta vida con alcance limitado.
- Rotación automática de credenciales de BD y API keys cuando el proveedor lo permita.

## Respuesta ante fuga de secreto
1. Revocar/rotar inmediatamente.
2. Revisar logs de uso del secreto desde su exposición.
3. Evaluar alcance (datos/sistemas accesibles) y notificar según corresponda.
4. Eliminar del historial (opcional) y corregir la causa raíz (control preventivo).

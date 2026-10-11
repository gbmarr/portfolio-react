# Spec — Línea base DevSecOps y cadena de suministro

> **Track ID:** `sec_devsecops_baseline_20261011`
> **Fuente:** Hallazgo **SEC-007 (Baja)** de la auditoría de seguridad run-2.
> **Estado:** 🧪 En implementación (código listo; V.1 pendiente de push/CI en GitHub).

---

## 1. Contexto y objetivo

El proyecto no tiene integración continua (`.github/` ausente), ni análisis de dependencias (SCA), ni SAST, ni SBOM, ni Dependabot; las dependencias usan rangos `^`. Tampoco hay `/.well-known/security.txt`. Esto dificulta detectar oportunamente vulnerabilidades en dependencias y no ofrece un canal formal de reporte.

**Objetivo:** establecer una línea base de controles de cadena de suministro y publicación de un canal de seguridad, priorizando lo de mayor relación valor/esfuerzo.

## 2. Functional Requirements

- **FR1 —** Activar **Dependabot** (o renovate) para npm y GitHub Actions.
- **FR2 —** Workflow de CI que corra `npm ci`, `lint`, `typecheck`, `test`, `build` y **`npm audit`** (fallar/avisar según política de severidad).
- **FR3 —** Publicar `public/.well-known/security.txt` con contacto de seguridad.
- **FR4 —** (Fase 2) SAST y generación de **SBOM** (p. ej. `cyclonedx`).

## 3. Non-Functional Requirements

- **NFR1 —** CI razonablemente rápido (no bloquear el flujo del dueño).
- **NFR2 —** No introducir costos (respetar fair-use Hobby / gratuito).
- **NFR3 —** Documentar la política de severidad que rompe el build.

## 4. Acceptance Criteria

- [x] Dependabot activo y con PRs (config `.github/dependabot.yml` verificable; PRs automáticos tras push a main).
- [ ] CI verde en `main` corriendo tests + `npm audit` (requiere push + ejecución de GitHub Actions).
- [ ] `https://gabrielmarrero.com.ar/.well-known/security.txt` accesible (requiere deploy de `public/.well-known/security.txt`).
- [x] (Fase 2) SAST/SBOM: CodeQL en `codeql.yml` + SBOM CycloneDX como artefacto en `ci.yml`.

## 5. Out of Scope

- Firmado de artefactos / SLSA completo.
- Gestión de secretos externa (Vault, etc.).
